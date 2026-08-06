import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import { UsersModule } from '../users/users.module';
import { EventBusModule } from '../common/events/event-bus.module';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { SubscriptionService } from './subscription.service';
import { SubscriptionCronService } from './services/subscription-cron.service';
import { SubscriptionController, AdminSubscriptionController } from './subscription.controller';

import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlan, UserSubscription, User]), UsersModule, EventBusModule],
  controllers: [SubscriptionController, AdminSubscriptionController],
  providers: [SubscriptionService, SubscriptionCronService, DemoAuthGuard],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
