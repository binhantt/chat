import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import {
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_MS,
} from '../constants/auth-token.constant';

interface RefreshSession {
  userId: string;
  expiresAt: number;
  banStatus: string;
  violationCount: number;
  lastViolationDate: Date | null;
}

@Injectable()
export class AuthTokenService {
  private readonly refreshSessions = new Map<string, RefreshSession>();

  createAccessToken(userId: string): string {
    const expiresAt = Date.now() + ACCESS_TOKEN_TTL_MS;
    const signature = this.signAccessToken(userId, expiresAt);

    return `user:${userId}:${expiresAt}:${signature}`;
  }

  createRefreshToken(userId: string): string {
    const tokenId = randomUUID();
    const expiresAt = Date.now() + REFRESH_TOKEN_TTL_MS;
    const signature = this.signRefreshToken(tokenId, expiresAt);

    this.refreshSessions.set(tokenId, this.createSession(userId, expiresAt));

    return `refresh:${tokenId}:${expiresAt}:${signature}`;
  }

  verifyRefreshToken(refreshToken: string | null): string {
    if (!refreshToken) {
      throw new UnauthorizedException('Thieu refresh token');
    }

    const tokenId = this.verifyRefreshTokenSignature(refreshToken);
    const session = this.refreshSessions.get(tokenId);

    return this.getSessionUserId(tokenId, session);
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

      if (parts.length !== 4 || parts[0] !== 'user') {
        return null;
      }

      const [, userId, expiresAtRaw, signature] = parts;
      const expiresAt = Number(expiresAtRaw);

      if (!userId || !signature || !Number.isFinite(expiresAt)) {
        return null;
      }

      if (expiresAt <= Date.now()) {
        return null;
      }

      const expectedSignature = this.signAccessToken(userId, expiresAt);

      return this.safeCompare(signature, expectedSignature) ? userId : null;
    } catch {
      return null;
    }
  }

  private createSession(userId: string, expiresAt: number): RefreshSession {
    return {
      userId,
      expiresAt,
      banStatus: 'active',
      violationCount: 0,
      lastViolationDate: null,
    };
  }

  private getSessionUserId(
    tokenId: string,
    session: RefreshSession | undefined,
  ): string {
    if (!session || session.expiresAt <= Date.now()) {
      this.refreshSessions.delete(tokenId);
      throw new UnauthorizedException(
        'Refresh token khong hop le hoac da het han',
      );
    }

    return session.userId;
  }

  private verifyRefreshTokenSignature(refreshToken: string): string {
    const parts = refreshToken.split(':');

    if (parts.length !== 4 || parts[0] !== 'refresh') {
      throw new UnauthorizedException('Refresh token khong hop le');
    }

    const [, tokenId, expiresAtRaw, signature] = parts;
    const expiresAt = Number(expiresAtRaw);

    if (!tokenId || !signature || !Number.isFinite(expiresAt)) {
      throw new UnauthorizedException('Refresh token khong hop le');
    }

    if (expiresAt <= Date.now()) {
      this.refreshSessions.delete(tokenId);
      throw new UnauthorizedException('Refresh token da het han');
    }

    const expectedSignature = this.signRefreshToken(tokenId, expiresAt);

    if (!this.safeCompare(signature, expectedSignature)) {
      throw new UnauthorizedException('Refresh token sai chu ky');
    }

    return tokenId;
  }

  private signRefreshToken(tokenId: string, expiresAt: number): string {
    return createHmac('sha256', this.getRefreshTokenSecret())
      .update(`${tokenId}:${expiresAt}`)
      .digest('base64url');
  }

  private signAccessToken(userId: string, expiresAt: number): string {
    return createHmac('sha256', this.getAccessTokenSecret())
      .update(`${userId}:${expiresAt}`)
      .digest('base64url');
  }

  private safeCompare(value: string, expected: string): boolean {
    const valueBuffer = Buffer.from(value);
    const expectedBuffer = Buffer.from(expected);

    if (valueBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(valueBuffer, expectedBuffer);
  }

  private getRefreshTokenSecret(): string {
    return (
      process.env.REFRESH_TOKEN_SECRET ||
      process.env.AUTH_TOKEN_SECRET ||
      'dev-refresh-token-secret-change-me'
    );
  }

  private getAccessTokenSecret(): string {
    return (
      process.env.ACCESS_TOKEN_SECRET ||
      process.env.AUTH_TOKEN_SECRET ||
      'dev-access-token-secret-change-me'
    );
  }

  banUser(userId: string): void {
    for (const session of this.refreshSessions.values()) {
      if (session.userId === userId) {
        session.banStatus = 'banned';
        session.violationCount += 1;
        session.lastViolationDate = new Date();
      }
    }
  }

  incrementViolationCount(userId: string): void {
    for (const session of this.refreshSessions.values()) {
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
