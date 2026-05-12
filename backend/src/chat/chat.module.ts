import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatRealtimeService } from './chat-realtime.service';

import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ConductModule } from '../conduct/conduct.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, User]),
    AuthModule,
    UsersModule,
    ConductModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatRealtimeService],
  exports: [ChatService],
})
export class ChatModule {}
