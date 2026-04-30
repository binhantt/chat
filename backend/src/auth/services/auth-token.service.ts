import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_MS,
} from '../constants/auth-token.constant';

interface RefreshSession {
  userId: string;
  expiresAt: number;
}

@Injectable()
export class AuthTokenService {
  private readonly refreshSessions = new Map<string, RefreshSession>();

  createAccessToken(userId: string): string {
    return `user:${userId}:${Date.now() + ACCESS_TOKEN_TTL_MS}`;
  }

  createRefreshToken(userId: string): string {
    const refreshToken = `refresh:${randomUUID()}`;
    this.refreshSessions.set(refreshToken, this.createSession(userId));
    return refreshToken;
  }

  verifyRefreshToken(refreshToken: string | null): string {
    if (!refreshToken) {
      throw new UnauthorizedException('Thiếu refresh token');
    }

    const session = this.refreshSessions.get(refreshToken);
    return this.getSessionUserId(refreshToken, session);
  }

  getAccessTokenMaxAge(): number {
    return ACCESS_TOKEN_TTL_MS;
  }

  getRefreshTokenMaxAge(): number {
    return REFRESH_TOKEN_TTL_MS;
  }

  private createSession(userId: string): RefreshSession {
    return {
      userId,
      expiresAt: Date.now() + REFRESH_TOKEN_TTL_MS,
    };
  }

  private getSessionUserId(
    refreshToken: string,
    session: RefreshSession | undefined,
  ): string {
    if (!session || session.expiresAt <= Date.now()) {
      this.refreshSessions.delete(refreshToken);
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    return session.userId;
  }
}
