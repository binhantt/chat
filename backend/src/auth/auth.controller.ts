import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { EmailLoginDto } from './dto/email-login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { AuthCookieService } from './services/auth-cookie.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

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
    return result;
  }
}

@Controller('api/admin/v1')
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
