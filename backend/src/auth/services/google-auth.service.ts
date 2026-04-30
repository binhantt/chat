import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GoogleTokenPayload } from '../interfaces/google-token-payload.interface';

@Injectable()
export class GoogleAuthService {
  verifyToken(idToken: string): GoogleTokenPayload {
    if (!idToken) {
      throw new BadRequestException('Thiếu Google idToken');
    }

    if (idToken.startsWith('demo:')) {
      return this.parseDemoToken(idToken);
    }

    throw new UnauthorizedException(
      'Chưa cấu hình xác thực Google thật. Dùng token demo theo dạng demo:<googleId>:<email>:<fullName>',
    );
  }

  private parseDemoToken(idToken: string): GoogleTokenPayload {
    const [, sub, email, name] = idToken.split(':');

    if (!sub || !email) {
      throw new UnauthorizedException(
        'Token demo không hợp lệ. Ví dụ: demo:google-123:user@example.com:Nguyen Van A',
      );
    }

    return { sub, email, name, picture: undefined };
  }
}
