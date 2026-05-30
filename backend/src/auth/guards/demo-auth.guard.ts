import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from '../../users/users.service';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { AuthCookieService } from '../services/auth-cookie.service';

@Injectable()
export class DemoAuthGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const { refreshedAccessToken, userId } =
      this.authCookieService.resolveAuthenticatedSession(request);

    if (!userId) {
      throw new UnauthorizedException('Phien dang nhap da het han');
    }

    const user = await this.usersService.findById(userId);

    if (!user || this.usersService.isLoginLocked(user)) {
      this.authCookieService.clearAuthCookies(response);
      throw new UnauthorizedException(
        user
          ? this.usersService.getLockMessage(user)
          : 'User khong ton tai hoac da bi khoa',
      );
    }

    request.user = user;
    if (refreshedAccessToken) {
      this.authCookieService.setAccessToken(response, refreshedAccessToken);
      this.authCookieService.setUserId(response, user.id);
      this.authCookieService.setCsrfToken(response);
    }

    return true;
  }
}
