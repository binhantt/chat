import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { ChatService } from './chat.service';
import { AdminChatController, ChatController } from './chat.controller';
import { ChatRealtimeService } from './chat-realtime.service';
import { MatchQueue } from '../match/entities/match-queue.entity';

import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ConductModule } from '../conduct/conduct.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, User, MatchQueue]),
    AuthModule,
    UsersModule,
    ConductModule,
  ],
  controllers: [ChatController, AdminChatController],
  providers: [ChatService, ChatRealtimeService],
  exports: [ChatService, ChatRealtimeService],
})
export class ChatModule {}
