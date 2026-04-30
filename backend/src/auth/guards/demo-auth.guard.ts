import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
    const userId = this.authCookieService.resolveAuthenticatedUserId(request);

    if (!userId) {
      throw new UnauthorizedException('Thieu access token');
    }

    const user = await this.usersService.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User khong ton tai hoac da bi khoa');
    }

    request.user = user;

    return true;
  }
}
