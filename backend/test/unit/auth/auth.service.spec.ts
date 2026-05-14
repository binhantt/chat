import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../../src/auth/auth.service';
import {
  User,
  UserLockType,
  UserRole,
} from '../../../src/users/entities/user.entity';

describe('AuthService', () => {
  const user = Object.assign(new User(), {
    id: 'user-1',
    email: 'user@example.com',
    role: UserRole.User,
    isActive: true,
    lockType: UserLockType.None,
    lockedUntil: null,
  });

  const admin = Object.assign(new User(), {
    ...user,
    id: 'admin-1',
    email: 'admin@example.com',
    role: UserRole.Admin,
  });

  let usersService: {
    upsertFromGoogle: jest.Mock;
    validatePassword: jest.Mock;
    isLoginLocked: jest.Mock;
    getLockMessage: jest.Mock;
    findById: jest.Mock;
  };
  let authTokenService: {
    createAccessToken: jest.Mock;
    createRefreshToken: jest.Mock;
    verifyRefreshToken: jest.Mock;
  };
  let googleAuthService: { verifyToken: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    usersService = {
      upsertFromGoogle: jest.fn(),
      validatePassword: jest.fn(),
      isLoginLocked: jest.fn().mockReturnValue(false),
      getLockMessage: jest.fn().mockReturnValue('locked'),
      findById: jest.fn(),
    };
    authTokenService = {
      createAccessToken: jest.fn().mockReturnValue('access-token'),
      createRefreshToken: jest.fn().mockReturnValue('refresh-token'),
      verifyRefreshToken: jest.fn(),
    };
    googleAuthService = {
      verifyToken: jest.fn(),
    };
    service = new AuthService(
      usersService as never,
      authTokenService as never,
      googleAuthService as never,
    );
  });

  it('logs in with Google and creates both tokens', async () => {
    googleAuthService.verifyToken.mockResolvedValue({
      sub: 'google-1',
      email: user.email,
      name: 'Test User',
      picture: 'avatar.png',
    });
    usersService.upsertFromGoogle.mockResolvedValue(user);

    const result = await service.googleLogin('id-token');

    expect(usersService.upsertFromGoogle).toHaveBeenCalledWith({
      email: user.email,
      googleId: 'google-1',
      fullName: 'Test User',
      avatarUrl: 'avatar.png',
    });
    expect(result).toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user,
    });
  });

  it('rejects invalid email/password credentials', async () => {
    usersService.validatePassword.mockResolvedValue(null);

    await expect(
      service.emailLogin(user.email, 'bad-password'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects login when the user is locked', async () => {
    usersService.validatePassword.mockResolvedValue(user);
    usersService.isLoginLocked.mockReturnValue(true);

    await expect(service.emailLogin(user.email, 'password')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('allows admin email login only for admins', async () => {
    usersService.validatePassword.mockResolvedValue(admin);

    await expect(
      service.adminEmailLogin(admin.email, 'password'),
    ).resolves.toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: admin,
    });
  });

  it('rejects admin login for normal users', async () => {
    usersService.validatePassword.mockResolvedValue(user);

    await expect(
      service.adminEmailLogin(user.email, 'password'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('refreshes access token for a valid refresh token', async () => {
    authTokenService.verifyRefreshToken.mockReturnValue(user.id);
    usersService.findById.mockResolvedValue(user);

    await expect(service.refreshAccessToken('refresh-token')).resolves.toEqual({
      message: expect.any(String),
      accessToken: 'access-token',
      user,
    });
  });

  it('rejects refresh when the user no longer exists', async () => {
    authTokenService.verifyRefreshToken.mockReturnValue(user.id);
    usersService.findById.mockResolvedValue(null);

    await expect(service.refreshAccessToken('refresh-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
