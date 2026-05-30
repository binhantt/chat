import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { performance } from 'node:perf_hooks';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ProfileSetupDto } from './dto/profile-setup.dto';
import { UpdateUserAccessDto } from './dto/update-user-access.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserLockType, UserRole } from './entities/user.entity';
import { GoogleUserProfile } from './interfaces/google-user-profile.interface';
import { PasswordService } from './services/password.service';
import { UserFactoryService } from './services/user-factory.service';

type AdminUserListRow = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  lockType: UserLockType;
  lockedUntil: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  private readonly userCacheTtlMs = 5000;
  private readonly userCache = new Map<
    string,
    { user: User; expiresAt: number }
  >();

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly passwordService: PasswordService,
    private readonly userFactoryService: UserFactoryService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.DB_BOOTSTRAP_SCHEMA === 'true') {
      await this.ensureUsersTable();
    }
    await this.seedDefaultAdmin();
  }

  async findById(id: string): Promise<User | null> {
    const cached = this.userCache.get(id);
    if (cached && cached.expiresAt > Date.now()) {
      return this.toSafeUser(cached.user);
    }

    const user = await this.usersRepository.findOne({
      select: {
        id: true,
        email: true,
        googleId: true,
        fullName: true,
        avatarUrl: true,
        dateOfBirth: true,
        phoneNumber: true,
        bio: true,
        gender: true,
        city: true,
        role: true,
        isActive: true,
        lockType: true,
        lockedUntil: true,
        lockReason: true,
        lockedByReportId: true,
        createdAt: true,
        updatedAt: true,
      },
      where: { id },
    });
    if (user) {
      await this.clearExpiredLock(user);
      this.cacheUser(user);
    }
    return user;
  }

  async findAll({
    cursor,
    limit = 20,
    status,
  }: {
    cursor?: string;
    limit?: number;
    status?: 'active' | 'banned';
  } = {}): Promise<{
    items: User[];
    limit: number;
    nextCursor: string | null;
  }> {
    const safeLimit = Math.min(Math.max(limit || 20, 1), 100);
    const query = this.usersRepository
      .createQueryBuilder('user')
      .select('user.id', 'id')
      .addSelect('user.email', 'email')
      .addSelect('user.fullName', 'fullName')
      .addSelect('user.avatarUrl', 'avatarUrl')
      .addSelect('user.role', 'role')
      .addSelect('user.isActive', 'isActive')
      .addSelect('user.lockType', 'lockType')
      .addSelect('user.lockedUntil', 'lockedUntil')
      .addSelect('user.createdAt', 'createdAt')
      .addSelect('user.updatedAt', 'updatedAt')
      .orderBy('user.createdAt', 'DESC')
      .addOrderBy('user.id', 'DESC')
      .take(safeLimit + 1);

    if (status === 'active') {
      query.where('user.isActive = :isActive AND user.lockType = :lockType', {
        isActive: true,
        lockType: UserLockType.None,
      });
    } else if (status === 'banned') {
      query.where('(user.isActive = :isActive OR user.lockType != :lockType)', {
        isActive: false,
        lockType: UserLockType.None,
      });
    }

    const decodedCursor = this.decodeUserCursor(cursor);
    if (decodedCursor) {
      const condition =
        '(user.createdAt < :createdAt OR (user.createdAt = :createdAt AND user.id < :id))';
      if (status === 'active' || status === 'banned') {
        query.andWhere(condition, decodedCursor);
      } else {
        query.where(condition, decodedCursor);
      }
    }

    const rows = await query.getRawMany<AdminUserListRow>();
    const items = rows
      .slice(0, safeLimit)
      .map((row) => this.toAdminUserListItem(row));
    const nextCursor =
      rows.length > safeLimit
        ? this.encodeUserCursor(items[items.length - 1])
        : null;

    return { items, limit: safeLimit, nextCursor };
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
    timing?: { dbMs?: number; passwordMs?: number },
  ): Promise<User | null> {
    const dbStart = performance.now();
    const user = await this.findByEmailWithPassword(email);
    if (timing) {
      timing.dbMs = performance.now() - dbStart;
    }

    if (!user?.passwordHash) {
      return null;
    }

    const passwordStart = performance.now();
    const passwordValid = this.passwordService.verify(
      password,
      user.passwordHash,
    );
    if (timing) {
      timing.passwordMs = performance.now() - passwordStart;
    }

    return passwordValid ? this.toSafeUser(user) : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const patch = this.toProfileUpdatePatch(updateUserDto);
    if (Object.keys(patch).length === 0) {
      return this.findByIdOrFail(id);
    }

    const result = await this.usersRepository.update(id, {
      ...patch,
      updatedAt: new Date(),
    });

    if (!result.affected) {
      throw new NotFoundException('Không tìm thấy user');
    }

    this.invalidateUserCache(id);
    return this.findByIdOrFail(id);
  }

  async deleteOwnAccount(userId: string): Promise<void> {
    await this.findByIdOrFail(userId);

    await this.dataSource.transaction(async (manager) => {
      const conversations = await manager.query<Array<{ id: string }>>(
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

    this.invalidateUserCache(userId);
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
      ((updateUserAccessDto.role !== undefined &&
        updateUserAccessDto.role !== UserRole.Admin) ||
        updateUserAccessDto.isActive === false)
    ) {
      throw new BadRequestException(
        'Admin khong the tu ha quyen hoac tu khoa phien cua chinh minh',
      );
    }

    user.role = updateUserAccessDto.role ?? user.role;
    user.isActive = updateUserAccessDto.isActive ?? user.isActive;
    if (user.isActive && user.lockType !== UserLockType.None) {
      user.lockType = UserLockType.None;
      user.lockedUntil = null;
      user.lockReason = null;
      user.lockedByReportId = null;
    }
    user.updatedAt = new Date();

    return this.saveSafeUser(await this.usersRepository.save(user));
  }

  async unlockFromReport(userId: string, reportId: string): Promise<User> {
    const user = await this.findByIdOrFail(userId);

    if (user.lockedByReportId !== reportId) {
      return user;
    }

    user.isActive = true;
    user.lockType = UserLockType.None;
    user.lockedUntil = null;
    user.lockReason = null;
    user.lockedByReportId = null;
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
    return this.update(userId, profileSetupDto);
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
      this.invalidateUserCache(existingAdmin.id);
      this.logger.log(`Ensured admin account: ${adminEmail}`);
      return;
    }

    const admin = this.userFactoryService.createAdminUser(adminEmail);
    await this.usersRepository.save(admin);
    this.invalidateUserCache(admin.id);
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
    return this.usersRepository.findOne({
      where: [
        { googleId: profile.googleId },
        { email: profile.email.toLowerCase() },
      ],
    });
  }

  private updateGoogleUser(user: User, profile: GoogleUserProfile): User {
    user.googleId = profile.googleId;
    user.fullName = user.fullName ?? profile.fullName ?? null;
    user.avatarUrl = user.avatarUrl ?? profile.avatarUrl ?? null;
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
      await this.usersRepository.update(user.id, {
        isActive: user.isActive,
        lockType: user.lockType,
        lockedByReportId: user.lockedByReportId,
        lockedUntil: user.lockedUntil,
        lockReason: user.lockReason,
        updatedAt: user.updatedAt,
      });
      this.invalidateUserCache(user.id);
    }
  }

  private toSafeUser(user: User): User {
    return Object.assign(new User(), {
      ...user,
      passwordHash: null,
    });
  }

  private saveSafeUser(user: User): User {
    this.invalidateUserCache(user.id);
    return this.toSafeUser(user);
  }

  private toProfileUpdatePatch(
    data: Partial<UpdateUserDto | ProfileSetupDto>,
  ): Partial<User> {
    const patch: Partial<User> = {};

    if ('fullName' in data) {
      patch.fullName = data.fullName ?? null;
    }
    if ('avatarUrl' in data) {
      patch.avatarUrl = data.avatarUrl ?? null;
    }
    if ('dateOfBirth' in data) {
      patch.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    }
    if ('phoneNumber' in data) {
      patch.phoneNumber = data.phoneNumber ?? null;
    }
    if ('bio' in data) {
      patch.bio = data.bio ?? null;
    }
    if ('gender' in data) {
      patch.gender = data.gender ?? null;
    }
    if ('city' in data) {
      patch.city = data.city ?? null;
    }

    return patch;
  }

  private toAdminUserListItem(row: AdminUserListRow): User {
    return Object.assign(new User(), {
      id: row.id,
      email: row.email,
      googleId: null,
      fullName: row.fullName,
      avatarUrl: row.avatarUrl,
      dateOfBirth: null,
      phoneNumber: null,
      bio: null,
      gender: null,
      city: null,
      role: row.role,
      isActive: row.isActive,
      lockType: row.lockType,
      lockedUntil: row.lockedUntil ? new Date(row.lockedUntil) : null,
      lockReason: null,
      lockedByReportId: null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      passwordHash: null,
    });
  }

  private cacheUser(user: User): void {
    if (this.isLoginLocked(user)) {
      this.invalidateUserCache(user.id);
      return;
    }

    this.userCache.set(user.id, {
      user: this.toSafeUser(user),
      expiresAt: Date.now() + this.userCacheTtlMs,
    });
  }

  private invalidateUserCache(userId: string): void {
    this.userCache.delete(userId);
  }

  private encodeUserCursor(user: User): string {
    return Buffer.from(
      JSON.stringify({
        createdAt: user.createdAt.toISOString(),
        id: user.id,
      }),
    ).toString('base64url');
  }

  private decodeUserCursor(
    cursor?: string,
  ): { createdAt: Date; id: string } | null {
    if (!cursor) return null;

    try {
      const parsed = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      ) as { createdAt?: string; id?: string };
      if (!parsed.createdAt || !parsed.id) return null;

      const createdAt = new Date(parsed.createdAt);
      if (Number.isNaN(createdAt.getTime())) return null;

      return { createdAt, id: parsed.id };
    } catch {
      return null;
    }
  }
}
