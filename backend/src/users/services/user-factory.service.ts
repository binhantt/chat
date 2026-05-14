import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateUserDto } from '../dto/create-user.dto';
import { User, UserLockType, UserRole } from '../entities/user.entity';
import { GoogleUserProfile } from '../interfaces/google-user-profile.interface';
import { UserBuildInput } from '../interfaces/user-build-input.interface';
import { PasswordService } from './password.service';

@Injectable()
export class UserFactoryService {
  constructor(private readonly passwordService: PasswordService) {}

  createGoogleUser(profile: GoogleUserProfile): User {
    return this.createUser({
      email: profile.email,
      googleId: profile.googleId,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
    });
  }

  createEmailUser(createUserDto: CreateUserDto): User {
    return this.createUser({
      email: createUserDto.email,
      password: createUserDto.password,
      fullName: createUserDto.fullName,
      role: createUserDto.role,
    });
  }

  createAdminUser(email: string): User {
    return this.createUser({
      email,
      password: getRequiredSecret('ADMIN_PASSWORD', 'Admin@123456'),
      fullName: 'System Admin',
      role: UserRole.Admin,
    });
  }

  private createUser(input: UserBuildInput): User {
    const now = new Date();
    return Object.assign(new User(), {
      ...this.createIdentity(input),
      ...this.createProfile(input),
      ...this.createStatus(input, now),
    });
  }

  private createIdentity(input: UserBuildInput) {
    return {
      id: input.id ?? randomUUID(),
      email: input.email.toLowerCase(),
      googleId: input.googleId ?? null,
      passwordHash: this.createPasswordHash(input.password),
    };
  }

  private createProfile(input: UserBuildInput) {
    return {
      fullName: input.fullName ?? null,
      avatarUrl: input.avatarUrl ?? null,
      dateOfBirth: null,
      phoneNumber: null,
      bio: null,
    };
  }

  private createStatus(input: UserBuildInput, now: Date) {
    return {
      role: input.role ?? UserRole.User,
      isActive: true,
      lockType: UserLockType.None,
      lockedUntil: null,
      lockReason: null,
      lockedByReportId: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  private createPasswordHash(password: string | undefined): string | null {
    return password ? this.passwordService.hash(password) : null;
  }
}

function getRequiredSecret(name: string, developmentFallback: string): string {
  const value = process.env[name];

  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${name} must be configured in production`);
  }

  return developmentFallback;
}
