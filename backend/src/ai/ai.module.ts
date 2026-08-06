import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiSettings } from './entities/ai-settings.entity';
import { User } from '../users/entities/user.entity';
import { AiChatService } from './ai-chat.service';
import { AiAdminController } from './ai-admin.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([AiSettings, User]), UsersModule],
  providers: [AiChatService],
  controllers: [AiAdminController],
  exports: [AiChatService],
})
export class AiModule {}
