import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GoogleUserProfile } from '../users/interfaces/google-user-profile.interface';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthTokenService } from './services/auth-token.service';
import { GoogleAuthService } from './services/google-auth.service';

@Injectable()
export class AuthService {
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

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    return {
      message: 'Đăng nhập email/password thành công',
      accessToken: this.authTokenService.createAccessToken(user.id),
      refreshToken: this.authTokenService.createRefreshToken(user.id),
      user,
    };
  }

  async adminEmailLogin(email: string, password: string) {
    const result = await this.emailLogin(email, password);

    if (result.user.role !== UserRole.Admin) {
      throw new UnauthorizedException('Tài khoản không có quyền quản trị');
    }

    return {
      ...result,
      message: 'Đăng nhập quản trị thành công',
    };
  }

  async refreshAccessToken(refreshToken: string | null) {
    const userId = this.authTokenService.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User không tồn tại hoặc đã bị khóa');
    }

    return {
      message: 'Cấp lại access token thành công',
      accessToken: this.authTokenService.createAccessToken(user.id),
      user,
    };
  }
}
