import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { MatchQueue } from './entities/match-queue.entity';
import { SpeedBoost } from './entities/speed-boost.entity';
import { SpeedBoostService } from './services/speed-boost.service';
import { Conversation } from '../chat/entities/conversation.entity';
import { ChatModule } from '../chat/chat.module';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { EventBusModule } from '../common/events/event-bus.module';
import { AiModule } from '../ai/ai.module';
import { MatchQueueRepository } from './repositories/match-queue.repository';
import { JoinMatchHandler } from './commands/handlers/join-match.handler';
import { LeaveMatchHandler } from './commands/handlers/leave-match.handler';
import { GetMatchStatusHandler } from './queries/handlers/get-match-status.handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchQueue, SpeedBoost, Conversation, User]),
    ChatModule,
    UsersModule,
    SubscriptionModule,
    EventBusModule,
    AiModule,
  ],
  providers: [
    MatchService,
    SpeedBoostService,
    MatchQueueRepository,
    JoinMatchHandler,
    LeaveMatchHandler,
    GetMatchStatusHandler,
  ],
  controllers: [MatchController],
})
export class MatchModule {}
