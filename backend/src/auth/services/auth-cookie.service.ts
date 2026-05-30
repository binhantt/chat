import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { AuthTokenService } from './auth-token.service';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const USER_ID_COOKIE = 'user_id';
const CSRF_TOKEN_COOKIE = 'csrf_token';

@Injectable()
export class AuthCookieService {
  constructor(private readonly authTokenService: AuthTokenService) {}

  setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
    userId: string,
  ): void {
    this.setAccessToken(response, accessToken);
    this.setRefreshToken(response, refreshToken);
    this.setUserId(response, userId);
    this.setCsrfToken(response);
  }

  clearAuthCookies(response: Response): void {
    for (const name of [
      ACCESS_TOKEN_COOKIE,
      REFRESH_TOKEN_COOKIE,
      USER_ID_COOKIE,
      CSRF_TOKEN_COOKIE,
    ]) {
      response.clearCookie(name, {
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    }
  }

  setAccessToken(response: Response, accessToken: string): void {
    response.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...this.baseCookieOptions(true),
      maxAge: this.authTokenService.getAccessTokenMaxAge(),
    });
  }

  getCookie(cookieHeader: string | undefined, name: string): string | null {
    if (!cookieHeader) {
      return null;
    }

    const cookie = cookieHeader
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${name}=`));

    return cookie
      ? decodeURIComponent(cookie.split('=').slice(1).join('='))
      : null;
  }

  getAccessToken(cookieHeader: string | undefined): string | null {
    return this.getCookie(cookieHeader, ACCESS_TOKEN_COOKIE);
  }

  getRefreshToken(cookieHeader: string | undefined): string | null {
    return this.getCookie(cookieHeader, REFRESH_TOKEN_COOKIE);
  }

  getUserId(cookieHeader: string | undefined): string | null {
    return this.getCookie(cookieHeader, USER_ID_COOKIE);
  }

  resolveAuthenticatedUserId(request: AuthenticatedRequest): string | null {
    return this.resolveAuthenticatedSession(request).userId;
  }

  resolveAuthenticatedSession(request: AuthenticatedRequest): {
    userId: string | null;
    refreshedAccessToken: string | null;
  } {
    const authHeader = request.headers.authorization;

    if (authHeader?.startsWith('Bearer user:')) {
      return {
        userId: this.authTokenService.verifyAccessToken(
          authHeader.replace('Bearer ', '').trim(),
        ),
        refreshedAccessToken: null,
      };
    }

    const cookieToken = this.getAccessToken(request.headers.cookie);

    if (cookieToken?.startsWith('user:')) {
      const userId = this.authTokenService.verifyAccessToken(cookieToken);
      if (userId) {
        return { userId, refreshedAccessToken: null };
      }
    }

    const refreshToken = this.getRefreshToken(request.headers.cookie);

    if (refreshToken) {
      const refreshUserId = this.tryVerifyRefreshToken(refreshToken);

      if (refreshUserId) {
        return {
          userId: refreshUserId,
          refreshedAccessToken:
            this.authTokenService.createAccessToken(refreshUserId),
        };
      }
    }

    return { userId: null, refreshedAccessToken: null };
  }

  private setRefreshToken(response: Response, refreshToken: string): void {
    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...this.baseCookieOptions(true),
      maxAge: this.authTokenService.getRefreshTokenMaxAge(),
    });
  }

  setUserId(response: Response, userId: string): void {
    response.cookie(USER_ID_COOKIE, userId, {
      ...this.baseCookieOptions(false),
      maxAge: this.authTokenService.getRefreshTokenMaxAge(),
    });
  }

  setCsrfToken(response: Response): void {
    response.cookie(CSRF_TOKEN_COOKIE, randomBytes(32).toString('base64url'), {
      ...this.baseCookieOptions(false),
      maxAge: this.authTokenService.getRefreshTokenMaxAge(),
    });
  }

  private tryVerifyRefreshToken(refreshToken: string): string | null {
    try {
      return this.authTokenService.verifyRefreshToken(refreshToken);
    } catch {
      return null;
    }
  }

  private baseCookieOptions(httpOnly: boolean) {
    return {
      httpOnly,
      path: '/',
      sameSite: 'strict' as const,
      secure: process.env.NODE_ENV === 'production',
    };
  }
}
