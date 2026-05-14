import {
  UserLockType,
  UserRole,
} from '../../../../src/users/entities/user.entity';
import { UserFactoryService } from '../../../../src/users/services/user-factory.service';

describe('UserFactoryService', () => {
  const originalEnv = process.env;
  const passwordService = {
    hash: jest.fn((password: string) => `hash:${password}`),
  };
  let service: UserFactoryService;

  beforeEach(() => {
    process.env = { ...originalEnv };
    passwordService.hash.mockClear();
    service = new UserFactoryService(passwordService as never);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('creates a safe default Google user', () => {
    const user = service.createGoogleUser({
      email: 'USER@Example.com',
      googleId: 'google-1',
      fullName: 'User One',
      avatarUrl: 'avatar.png',
    });

    expect(user).toMatchObject({
      email: 'user@example.com',
      googleId: 'google-1',
      fullName: 'User One',
      avatarUrl: 'avatar.png',
      role: UserRole.User,
      isActive: true,
      lockType: UserLockType.None,
      passwordHash: null,
    });
  });

  it('hashes passwords for email users', () => {
    const user = service.createEmailUser({
      email: 'admin@example.com',
      password: 'password',
      fullName: 'Admin',
      role: UserRole.Admin,
    });

    expect(passwordService.hash).toHaveBeenCalledWith('password');
    expect(user).toMatchObject({
      email: 'admin@example.com',
      passwordHash: 'hash:password',
      role: UserRole.Admin,
    });
  });

  it('requires an explicit admin password in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ADMIN_PASSWORD;

    expect(() => service.createAdminUser('admin@example.com')).toThrow(
      'ADMIN_PASSWORD must be configured in production',
    );
  });
});
