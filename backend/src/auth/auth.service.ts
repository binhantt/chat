import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { performance } from 'node:perf_hooks';
import { GoogleUserProfile } from '../users/interfaces/google-user-profile.interface';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthTokenService } from './services/auth-token.service';
import { GoogleAuthService } from './services/google-auth.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly authTokenService: AuthTokenService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  async googleLogin(idToken: string) {
    const payload = await this.googleAuthService.verifyToken(idToken);
    const user = await this.usersService.upsertFromGoogle(
      this.toGoogleUserProfile(payload),
    );

    if (this.usersService.isLoginLocked(user)) {
      throw new UnauthorizedException(this.usersService.getLockMessage(user));
    }

    return {
      message: 'Đăng nhập Google thành công',
      accessToken: this.authTokenService.createAccessToken(user.id),
      refreshToken: this.authTokenService.createRefreshToken(user.id),
      user,
    };
  }

  private toGoogleUserProfile(payload: {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
  }): GoogleUserProfile {
    return {
      email: payload.email,
      googleId: payload.sub,
      fullName: payload.name,
      avatarUrl: payload.picture,
    };
  }

  async emailLogin(email: string, password: string) {
    const user = await this.usersService.validatePassword(email, password);

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (this.usersService.isLoginLocked(user)) {
      throw new UnauthorizedException(this.usersService.getLockMessage(user));
    }

    return {
      message: 'Đăng nhập email/password thành công',
      accessToken: this.authTokenService.createAccessToken(user.id),
      refreshToken: this.authTokenService.createRefreshToken(user.id),
      user,
    };
  }

  async adminEmailLogin(email: string, password: string) {
    const totalStart = performance.now();
    const timing: { dbMs?: number; passwordMs?: number } = {};

    const user = await this.usersService.validatePassword(
      email,
      password,
      timing,
    );

    if (!user) {
      this.logManagerLoginTiming(email, totalStart, timing);
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (this.usersService.isLoginLocked(user)) {
      this.logManagerLoginTiming(email, totalStart, timing);
      throw new UnauthorizedException(this.usersService.getLockMessage(user));
    }

    if (user.role !== UserRole.Admin) {
      this.logManagerLoginTiming(email, totalStart, timing);
      throw new UnauthorizedException('Tài khoản không có quyền quản trị');
    }

    const tokenStart = performance.now();
    const accessToken = this.authTokenService.createAccessToken(user.id);
    const refreshToken = this.authTokenService.createRefreshToken(user.id);
    const tokenMs = performance.now() - tokenStart;

    this.logManagerLoginTiming(email, totalStart, timing, tokenMs);

    return {
      message: 'Đăng nhập quản trị thành công',
      accessToken,
      refreshToken,
      user,
    };
  }

  async refreshAccessToken(refreshToken: string | null) {
    const userId = this.authTokenService.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(userId);

    if (!user || this.usersService.isLoginLocked(user)) {
      throw new UnauthorizedException(
        user
          ? this.usersService.getLockMessage(user)
          : 'User không tồn tại hoặc đã bị khóa',
      );
    }

    return {
      message: 'Cấp lại access token thành công',
      accessToken: this.authTokenService.createAccessToken(user.id),
      user,
    };
  }

  logout() {
    return {
      message: 'Đăng xuất thành công',
      success: true,
    };
  }

  private logManagerLoginTiming(
    email: string,
    totalStart: number,
    timing: { dbMs?: number; passwordMs?: number },
    tokenMs = 0,
  ): void {
    const totalMs = performance.now() - totalStart;
    const safeEmail = email.trim().toLowerCase();

    this.logger.log(
      `[manager-login] email=${safeEmail} total=${totalMs.toFixed(1)}ms db=${(timing.dbMs ?? 0).toFixed(1)}ms password=${(timing.passwordMs ?? 0).toFixed(1)}ms token=${tokenMs.toFixed(1)}ms`,
    );
  }
}
