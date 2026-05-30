import { UnauthorizedException } from '@nestjs/common';
import { AuthTokenService } from '../../../../src/auth/services/auth-token.service';

describe('AuthTokenService', () => {
  const userId = 'user-123';

  let service: AuthTokenService;
  let originalAuthSecret: string | undefined;
  let originalAccessSecret: string | undefined;
  let originalRefreshSecret: string | undefined;

  beforeEach(() => {
    originalAuthSecret = process.env.AUTH_TOKEN_SECRET;
    originalAccessSecret = process.env.ACCESS_TOKEN_SECRET;
    originalRefreshSecret = process.env.REFRESH_TOKEN_SECRET;

    process.env.AUTH_TOKEN_SECRET = 'test-auth-secret';
    delete process.env.ACCESS_TOKEN_SECRET;
    delete process.env.REFRESH_TOKEN_SECRET;

    service = new AuthTokenService();
  });

  afterEach(() => {
    restoreEnv('AUTH_TOKEN_SECRET', originalAuthSecret);
    restoreEnv('ACCESS_TOKEN_SECRET', originalAccessSecret);
    restoreEnv('REFRESH_TOKEN_SECRET', originalRefreshSecret);
    jest.restoreAllMocks();
  });

  it('creates a signed refresh token that resolves to the session user', () => {
    const refreshToken = service.createRefreshToken(userId);

    expect(refreshToken).toMatch(/^refresh:[^:]+:\d+:[A-Za-z0-9_-]+$/);
    expect(service.verifyRefreshToken(refreshToken)).toBe(userId);
  });

  it('rejects refresh tokens with a tampered token id', () => {
    const refreshToken = service.createRefreshToken(userId);
    const [, , expiresAt, signature] = refreshToken.split(':');
    const tamperedToken = `refresh:attacker-token:${expiresAt}:${signature}`;

    expect(() => service.verifyRefreshToken(tamperedToken)).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects refresh tokens with a tampered expiration', () => {
    const refreshToken = service.createRefreshToken(userId);
    const [, tokenId, expiresAt, signature] = refreshToken.split(':');
    const tamperedToken = `refresh:${tokenId}:${Number(expiresAt) + 1}:${signature}`;

    expect(() => service.verifyRefreshToken(tamperedToken)).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects refresh tokens with a tampered signature', () => {
    const refreshToken = service.createRefreshToken(userId);
    const [prefix, tokenId, expiresAt] = refreshToken.split(':');
    const tamperedToken = `${prefix}:${tokenId}:${expiresAt}:bad-signature`;

    expect(() => service.verifyRefreshToken(tamperedToken)).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects refresh tokens after their signed expiration', () => {
    const now = 1_700_000_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const refreshToken = service.createRefreshToken(userId);
    const expiresAt = Number(refreshToken.split(':')[2]);

    jest.spyOn(Date, 'now').mockReturnValue(expiresAt + 1);

    expect(() => service.verifyRefreshToken(refreshToken)).toThrow(
      UnauthorizedException,
    );
  });

  it('revokes refresh tokens', () => {
    const refreshToken = service.createRefreshToken(userId);

    service.revokeRefreshToken(refreshToken);

    expect(() => service.verifyRefreshToken(refreshToken)).toThrow(
      UnauthorizedException,
    );
  });

  it('creates an access token that cannot be forged by editing the user id', () => {
    const accessToken = service.createAccessToken(userId);
    const [, , expiresAt, signature] = accessToken.split(':');
    const forgedAccessToken = `user:admin:${expiresAt}:${signature}`;

    expect(service.verifyAccessToken(accessToken)).toBe(userId);
    expect(service.verifyAccessToken(forgedAccessToken)).toBeNull();
  });
});

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
