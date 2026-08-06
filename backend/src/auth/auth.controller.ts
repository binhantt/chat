import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { EmailLoginDto } from './dto/email-login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { GuestLoginDto } from './dto/guest-login.dto';
import { AuthCookieService } from './services/auth-cookie.service';
import { DemoAuthGuard } from './guards/demo-auth.guard';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import { GUEST_ACCESS_TOKEN_TTL_MS } from './constants/auth-token.constant';

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Post('guest-login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async guestLogin(
    @Body() body: GuestLoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const clientIp = (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || request.headers['x-real-ip'] as string
      || request.socket?.remoteAddress
      || undefined;

    const result = await this.authService.guestLogin(body.displayName, clientIp);
    this.authCookieService.setAuthCookies(
      response,
      result.accessToken,
      result.refreshToken,
      result.user.id,
      GUEST_ACCESS_TOKEN_TTL_MS,
    );
    return result;
  }

  @Post('guest-cleanup')
  async guestCleanup(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Manually resolve the user since DemoAuthGuard bypasses /api/v1/auth/*
    const session = this.authCookieService.resolveAuthenticatedSession(
      request as AuthenticatedRequest,
    );
    if (!session.userId) {
      return { message: 'Chua dang nhap', success: false };
    }
    const result = await this.authService.guestCleanup(session.userId);
    this.authCookieService.clearAuthCookies(response);
    return result;
  }

  @Post('google-login')
  async googleLogin(
    @Body() googleLoginDto: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.googleLogin(googleLoginDto.idToken);
    this.authCookieService.setAuthCookies(
      response,
      result.accessToken,
      result.refreshToken,
      result.user.id,
    );
    return result;
  }

  @Post('email-login')
  async emailLogin(
    @Body() emailLoginDto: EmailLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.emailLogin(
      emailLoginDto.email,
      emailLoginDto.password,
    );
    this.authCookieService.setAuthCookies(
      response,
      result.accessToken,
      result.refreshToken,
      result.user.id,
    );
    return result;
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.refreshAccessToken(
      this.authCookieService.getRefreshToken(request.headers.cookie),
    );
    this.authCookieService.setAccessToken(response, result.accessToken);
    this.authCookieService.setCsrfToken(response);
    return result;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    this.authCookieService.clearAuthCookies(response);
    return this.authService.logout();
  }
}

@Controller('v1/manager')
export class AdminAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Post('login')
  async login(
    @Body() emailLoginDto: EmailLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.adminEmailLogin(
      emailLoginDto.email,
      emailLoginDto.password,
    );
    this.authCookieService.setAuthCookies(
      response,
      result.accessToken,
      result.refreshToken,
      result.user.id,
    );
    return result;
  }
}
