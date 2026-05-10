import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_MS,
} from '../constants/auth-token.constant';

interface RefreshSession {
  userId: string;
  expiresAt: number;
  // New ban tracking fields
  banStatus: string; // 'active' or 'banned'
  violationCount: number;
  lastViolationDate: Date | null;
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

  verifyAccessToken(token: string | null): string | null {
    if (!token) {
      return null;
    }

    try {
      const parts = token.split(':');
      if (parts.length !== 3 || parts[0] !== 'user') {
        return null;
      }

      const userId = parts[1];
      const expiration = parseInt(parts[2], 10);

      if (isNaN(expiration) || expiration <= Date.now()) {
        return null;
      }

      return userId;
    } catch {
      return null;
    }
  }

  private createSession(userId: string): RefreshSession {
    return {
      userId,
      expiresAt: Date.now() + REFRESH_TOKEN_TTL_MS,
      banStatus: 'active',
      violationCount: 0,
      lastViolationDate: null,
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

  // New ban management methods
  banUser(userId: string): void {
    // Find all sessions for this user and set ban status
    for (const [token, session] of this.refreshSessions.entries()) {
      if (session.userId === userId) {
        session.banStatus = 'banned';
        session.violationCount += 1;
        session.lastViolationDate = new Date();
      }
    }
  }

  incrementViolationCount(userId: string): void {
    for (const [token, session] of this.refreshSessions.entries()) {
      if (session.userId === userId) {
        session.violationCount += 1;
        session.lastViolationDate = new Date();
      }
    }
  }

  isUserBanned(userId: string): boolean {
    for (const session of this.refreshSessions.values()) {
      if (session.userId === userId && session.banStatus === 'banned') {
        return true;
      }
    }
    return false;
  }
}
