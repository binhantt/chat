import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthCookieService } from '../auth/services/auth-cookie.service';
import { AuthTokenService } from '../auth/services/auth-token.service';
import { AbacGuard } from '../auth/guards/abac.guard';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import { User } from './entities/user.entity';
import { AdminSystemController } from './admin-system.controller';
import { AdminUserController, UserController } from './user.controller';
import { PasswordService } from './services/password.service';
import { UserFactoryService } from './services/user-factory.service';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController, AdminUserController, AdminSystemController],
  providers: [
    UsersService,
    PasswordService,
    UserFactoryService,
    AuthTokenService,
    AuthCookieService,
    DemoAuthGuard,
    AbacGuard,
  ],
  exports: [UsersService, AuthCookieService],
})
export class UsersModule {}
