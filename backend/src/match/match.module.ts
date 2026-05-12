import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { MatchQueue } from './entities/match-queue.entity';
import { Conversation } from '../chat/entities/conversation.entity';
import { User } from '../users/entities/user.entity';
import { UserRepository } from '../users/repositories/user.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchQueue, Conversation, User]),
    UsersModule,
  ],
  providers: [MatchService],
  controllers: [MatchController],
})
export class MatchModule {}
