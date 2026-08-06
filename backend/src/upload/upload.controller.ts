import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { Req } from '@nestjs/common';
import { UsersService } from '../users/users.service';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

@Controller('v1/upload')
@UseGuards(DemoAuthGuard)
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', '..', 'uploads', 'avatars'),
        filename: (_req, file, callback) => {
          const ext = extname(file.originalname).toLowerCase();
          const name = `${randomUUID()}${ext}`;
          callback(null, name);
        },
      }),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIMES.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              'Chi chap nhan file anh: JPEG, PNG, WebP, GIF',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('Vui long chon file anh');
    }

    const avatarUrl = `/api/uploads/avatars/${file.filename}`;

    await this.usersService.update(request.user!.id, { avatarUrl });

    this.logger.log(`Avatar updated for user ${request.user!.id}: ${avatarUrl}`);

    return {
      message: 'Cap nhat anh dai dien thanh cong',
      avatarUrl,
    };
  }
}
