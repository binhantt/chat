import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AdminAuthController, AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCookieService } from './services/auth-cookie.service';
import { AuthTokenService } from './services/auth-token.service';
import { GoogleAuthService } from './services/google-auth.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController, AdminAuthController],
  providers: [
    AuthService,
    AuthCookieService,
    AuthTokenService,
    GoogleAuthService,
  ],
  exports: [AuthService, AuthCookieService, AuthTokenService],
})
export class AuthModule {}
