import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ProfileSetupDto } from './dto/profile-setup.dto';
import { UpdateUserAccessDto } from './dto/update-user-access.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserLockType, UserRole } from './entities/user.entity';
import { GoogleUserProfile } from './interfaces/google-user-profile.interface';
import { PasswordService } from './services/password.service';
import { UserFactoryService } from './services/user-factory.service';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly passwordService: PasswordService,
    private readonly userFactoryService: UserFactoryService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureUsersTable();
    await this.seedDefaultAdmin();
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (user) {
      await this.clearExpiredLock(user);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return users.map((user) => this.toSafeUser(user));
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('Không tìm thấy user');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async upsertFromGoogle(profile: GoogleUserProfile): Promise<User> {
    const existingUser = await this.findGoogleUser(profile);

    if (existingUser) {
      return this.saveSafeUser(
        await this.usersRepository.save(
          this.updateGoogleUser(existingUser, profile),
        ),
      );
    }

    return this.saveSafeUser(
      await this.usersRepository.save(
        this.userFactoryService.createGoogleUser(profile),
      ),
    );
  }

  async createByAdmin(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('Email đã tồn tại');
    }

    return this.saveSafeUser(
      await this.usersRepository.save(
        this.userFactoryService.createEmailUser(createUserDto),
      ),
    );
  }

  async validatePassword(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.findByEmailWithPassword(email);

    if (!user?.passwordHash) {
      return null;
    }

    return this.passwordService.verify(password, user.passwordHash)
      ? this.toSafeUser(user)
      : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findByIdOrFail(id);

    Object.assign(user, {
      ...updateUserDto,
      updatedAt: new Date(),
    });

    return this.saveSafeUser(await this.usersRepository.save(user));
  }

  async deleteOwnAccount(userId: string): Promise<void> {
    await this.findByIdOrFail(userId);

    await this.dataSource.transaction(async (manager) => {
      const conversations = await manager.query(
        `
          SELECT id
          FROM conversations
          WHERE user1_id = $1 OR user2_id = $1
        `,
        [userId],
      );
      const conversationIds = conversations.map(
        (conversation) => conversation.id,
      );

      if (conversationIds.length > 0) {
        await manager.query(
          `
            DELETE FROM messages
            WHERE conversation_id = ANY($1::uuid[])
          `,
          [conversationIds],
        );
      }

      await manager.query(
        `
          DELETE FROM messages
          WHERE sender_id = $1
        `,
        [userId],
      );

      await manager.query(
        `
          DELETE FROM match_queue
          WHERE "userId" = $1 OR "matchedWithUserId" = $1
        `,
        [userId],
      );

      await manager.query(
        `
          DELETE FROM reports
          WHERE reporter_id = $1
            OR reported_user_id = $1
            OR reviewed_by_admin_id = $1
        `,
        [userId],
      );

      if (conversationIds.length > 0) {
        await manager.query(
          `
            DELETE FROM conversations
            WHERE id = ANY($1::uuid[])
          `,
          [conversationIds],
        );
      }

      await manager.query(
        `
          DELETE FROM users
          WHERE id = $1
        `,
        [userId],
      );
    });

    this.logger.log(`Deleted user account and related data: ${userId}`);
  }

  async updateAccess(
    id: string,
    updateUserAccessDto: UpdateUserAccessDto,
    actingUserId: string,
  ): Promise<User> {
    const user = await this.findByIdOrFail(id);

    if (
      actingUserId === id &&
      (updateUserAccessDto.role !== UserRole.Admin ||
        !updateUserAccessDto.isActive)
    ) {
      throw new BadRequestException(
        'Admin khong the tu ha quyen hoac tu khoa phien cua chinh minh',
      );
    }

    user.role = updateUserAccessDto.role ?? user.role;
    user.isActive = updateUserAccessDto.isActive ?? user.isActive;
    if (user.isActive && user.lockType === UserLockType.Permanent) {
      user.lockType = UserLockType.None;
      user.lockedUntil = null;
      user.lockReason = null;
      user.lockedByReportId = null;
    }
    user.updatedAt = new Date();

    return this.saveSafeUser(await this.usersRepository.save(user));
  }

  async lockFromReport(
    userId: string,
    lockType: UserLockType,
    reportId: string,
    reason: string,
  ): Promise<User> {
    const user = await this.findByIdOrFail(userId);
    const now = Date.now();

    user.lockType = lockType;
    user.lockedByReportId = reportId;
    user.lockReason = reason;
    user.updatedAt = new Date();

    if (lockType === UserLockType.FifteenDays) {
      user.lockedUntil = new Date(now + 15 * 24 * 60 * 60 * 1000);
      user.isActive = true;
    } else if (lockType === UserLockType.ThirtyDays) {
      user.lockedUntil = new Date(now + 30 * 24 * 60 * 60 * 1000);
      user.isActive = true;
    } else if (lockType === UserLockType.Permanent) {
      user.lockedUntil = null;
      user.isActive = false;
    } else {
      user.lockedUntil = null;
      user.lockReason = null;
      user.lockedByReportId = null;
      user.isActive = true;
    }

    return this.saveSafeUser(await this.usersRepository.save(user));
  }

  isLoginLocked(user: User): boolean {
    if (!user.isActive || user.lockType === UserLockType.Permanent) {
      return true;
    }

    return !!user.lockedUntil && user.lockedUntil.getTime() > Date.now();
  }

  getLockMessage(user: User): string {
    if (user.lockType === UserLockType.Permanent || !user.isActive) {
      return 'Nguoi dung da vi pham va bi khoa vinh vien';
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const date = user.lockedUntil.toLocaleDateString('vi-VN');
      return `Nguoi dung da vi pham va bi khoa den ngay ${date}`;
    }

    return 'Tai khoan dang hoat dong';
  }

  async setupProfile(
    userId: string,
    profileSetupDto: ProfileSetupDto,
  ): Promise<User> {
    const user = await this.findByIdOrFail(userId);

    Object.assign(user, {
      ...profileSetupDto,
      updatedAt: new Date(),
    });

    return this.saveSafeUser(await this.usersRepository.save(user));
  }

  private async seedDefaultAdmin(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@123456';
    const existingAdmin = await this.findByEmailWithPassword(adminEmail);

    if (existingAdmin) {
      existingAdmin.passwordHash = this.passwordService.hash(adminPassword);
      existingAdmin.role = UserRole.Admin;
      existingAdmin.isActive = true;
      existingAdmin.lockType = UserLockType.None;
      existingAdmin.lockedUntil = null;
      existingAdmin.lockReason = null;
      existingAdmin.lockedByReportId = null;
      existingAdmin.fullName = existingAdmin.fullName ?? 'System Admin';
      existingAdmin.updatedAt = new Date();
      await this.usersRepository.save(existingAdmin);
      this.logger.log(`Ensured admin account: ${adminEmail}`);
      return;
    }

    const admin = this.userFactoryService.createAdminUser(adminEmail);
    await this.usersRepository.save(admin);
    this.logger.log(`Seeded admin account: ${adminEmail}`);
  }

  private async ensureUsersTable(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      const hasUsersTable = await queryRunner.hasTable('users');

      if (hasUsersTable) {
        return;
      }

      await this.dataSource.synchronize(false);
      this.logger.log('Created database schema for users table');
    } finally {
      await queryRunner.release();
    }
  }

  private async findGoogleUser(
    profile: GoogleUserProfile,
  ): Promise<User | null> {
    return (
      (await this.findByGoogleId(profile.googleId)) ??
      (await this.findByEmail(profile.email))
    );
  }

  private updateGoogleUser(user: User, profile: GoogleUserProfile): User {
    user.googleId = profile.googleId;
    user.fullName = profile.fullName ?? user.fullName;
    user.avatarUrl = profile.avatarUrl ?? user.avatarUrl;
    user.updatedAt = new Date();
    return user;
  }

  private async findByEmailWithPassword(email: string): Promise<User | null> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
    if (user) {
      await this.clearExpiredLock(user);
    }
    return user;
  }

  private async clearExpiredLock(user: User): Promise<void> {
    if (
      user.lockedUntil &&
      user.lockedUntil.getTime() <= Date.now() &&
      user.lockType !== UserLockType.Permanent
    ) {
      user.lockType = UserLockType.None;
      user.lockedUntil = null;
      user.lockReason = null;
      user.lockedByReportId = null;
      user.isActive = true;
      user.updatedAt = new Date();
      await this.usersRepository.save(user);
    }
  }

  private toSafeUser(user: User): User {
    return Object.assign(new User(), {
      ...user,
      passwordHash: null,
    });
  }

  private saveSafeUser(user: User): User {
    return this.toSafeUser(user);
  }
}
