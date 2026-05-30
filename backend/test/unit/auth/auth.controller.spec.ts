import {
  AdminAuthController,
  AuthController,
} from '../../../src/auth/auth.controller';

describe('AuthController', () => {
  let authService: {
    googleLogin: jest.Mock;
    emailLogin: jest.Mock;
    refreshAccessToken: jest.Mock;
    adminEmailLogin: jest.Mock;
    logout: jest.Mock;
  };
  let authCookieService: {
    setAuthCookies: jest.Mock;
    getRefreshToken: jest.Mock;
    setAccessToken: jest.Mock;
    setCsrfToken: jest.Mock;
    clearAuthCookies: jest.Mock;
  };
  let response: { cookie: jest.Mock };

  beforeEach(() => {
    authService = {
      googleLogin: jest.fn(),
      emailLogin: jest.fn(),
      refreshAccessToken: jest.fn(),
      adminEmailLogin: jest.fn(),
      logout: jest.fn(),
    };
    authCookieService = {
      setAuthCookies: jest.fn(),
      getRefreshToken: jest.fn(),
      setAccessToken: jest.fn(),
      setCsrfToken: jest.fn(),
      clearAuthCookies: jest.fn(),
    };
    response = { cookie: jest.fn() };
  });

  it('sets cookies after Google login', async () => {
    const result = {
      accessToken: 'access',
      refreshToken: 'refresh',
      user: { id: 'user-1' },
    };
    authService.googleLogin.mockResolvedValue(result);
    const controller = new AuthController(
      authService as never,
      authCookieService as never,
    );

    await expect(
      controller.googleLogin({ idToken: 'id-token' }, response as never),
    ).resolves.toBe(result);
    expect(authCookieService.setAuthCookies).toHaveBeenCalledWith(
      response,
      'access',
      'refresh',
      'user-1',
    );
  });

  it('uses refresh cookie and only replaces access token on refresh', async () => {
    authCookieService.getRefreshToken.mockReturnValue('refresh');
    authService.refreshAccessToken.mockResolvedValue({
      accessToken: 'new-access',
      user: { id: 'user-1' },
    });
    const controller = new AuthController(
      authService as never,
      authCookieService as never,
    );

    await controller.refresh(
      { headers: { cookie: 'refresh_token=refresh' } } as never,
      response as never,
    );

    expect(authService.refreshAccessToken).toHaveBeenCalledWith('refresh');
    expect(authCookieService.setAccessToken).toHaveBeenCalledWith(
      response,
      'new-access',
    );
    expect(authCookieService.setCsrfToken).toHaveBeenCalledWith(response);
  });

  it('revokes refresh token and clears cookies on logout', async () => {
    authCookieService.getRefreshToken.mockReturnValue('refresh');
    authService.logout.mockReturnValue({ success: true });
    const controller = new AuthController(
      authService as never,
      authCookieService as never,
    );

    expect(
      controller.logout(
        { headers: { cookie: 'refresh_token=refresh' } } as never,
        response as never,
      ),
    ).toEqual({ success: true });
    expect(authService.logout).toHaveBeenCalledWith('refresh');
    expect(authCookieService.clearAuthCookies).toHaveBeenCalledWith(response);
  });

  it('sets cookies after admin login', async () => {
    const result = {
      accessToken: 'admin-access',
      refreshToken: 'admin-refresh',
      user: { id: 'admin-1' },
    };
    authService.adminEmailLogin.mockResolvedValue(result);
    const controller = new AdminAuthController(
      authService as never,
      authCookieService as never,
    );

    await expect(
      controller.login(
        { email: 'admin@example.com', password: 'password' },
        response as never,
      ),
    ).resolves.toBe(result);
    expect(authCookieService.setAuthCookies).toHaveBeenCalledWith(
      response,
      'admin-access',
      'admin-refresh',
      'admin-1',
    );
  });
});
