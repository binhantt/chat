import { AuthCookieService } from '../../../../src/auth/services/auth-cookie.service';

describe('AuthCookieService', () => {
  let authTokenService: {
    getAccessTokenMaxAge: jest.Mock;
    getRefreshTokenMaxAge: jest.Mock;
    verifyAccessToken: jest.Mock;
    verifyRefreshToken: jest.Mock;
  };
  let service: AuthCookieService;

  beforeEach(() => {
    authTokenService = {
      getAccessTokenMaxAge: jest.fn().mockReturnValue(1000),
      getRefreshTokenMaxAge: jest.fn().mockReturnValue(2000),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };
    service = new AuthCookieService(authTokenService as never);
  });

  it('sets access, refresh, visible user id, and csrf cookies', () => {
    const response = { cookie: jest.fn() };

    service.setAuthCookies(response as never, 'access', 'refresh', 'user-1');

    expect(response.cookie).toHaveBeenCalledWith(
      'access_token',
      'access',
      expect.objectContaining({
        httpOnly: true,
        maxAge: 1000,
        path: '/',
        sameSite: 'strict',
      }),
    );
    expect(response.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh',
      expect.objectContaining({
        httpOnly: true,
        maxAge: 2000,
        path: '/',
        sameSite: 'strict',
      }),
    );
    expect(response.cookie).toHaveBeenCalledWith(
      'user_id',
      'user-1',
      expect.objectContaining({
        httpOnly: false,
        maxAge: 2000,
        path: '/',
        sameSite: 'strict',
      }),
    );
    expect(response.cookie).toHaveBeenCalledWith(
      'csrf_token',
      expect.any(String),
      expect.objectContaining({
        httpOnly: false,
        maxAge: 2000,
        path: '/',
        sameSite: 'strict',
      }),
    );
  });

  it('parses encoded cookies by name', () => {
    expect(
      service.getCookie('access_token=user%3A1; theme=dark', 'access_token'),
    ).toBe('user:1');
    expect(service.getCookie(undefined, 'access_token')).toBeNull();
  });

  it('resolves user id from bearer access token first', () => {
    authTokenService.verifyAccessToken.mockReturnValue('user-1');

    expect(
      service.resolveAuthenticatedUserId({
        headers: { authorization: 'Bearer user:abc', cookie: 'user_id=user-2' },
      } as never),
    ).toBe('user-1');
    expect(authTokenService.verifyAccessToken).toHaveBeenCalledWith('user:abc');
  });

  it('falls back to refresh token when access token is absent', () => {
    authTokenService.verifyRefreshToken.mockReturnValue('user-2');

    expect(
      service.resolveAuthenticatedUserId({
        headers: { cookie: 'refresh_token=refresh' },
      } as never),
    ).toBe('user-2');
  });

  it('returns null for invalid refresh token', () => {
    authTokenService.verifyRefreshToken.mockImplementation(() => {
      throw new Error('bad token');
    });

    expect(
      service.resolveAuthenticatedUserId({
        headers: { cookie: 'refresh_token=bad' },
      } as never),
    ).toBeNull();
  });
});
