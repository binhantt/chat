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
import { UpdateUserAccessDto } from './dto/update-user-access.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
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
    return this.usersRepository.findOne({ where: { id } });
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

    user.role = updateUserAccessDto.role;
    user.isActive = updateUserAccessDto.isActive;
    user.updatedAt = new Date();

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
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
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
