import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import { UsersModule } from '../users/users.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { EventBusModule } from '../common/events/event-bus.module';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payment.service';
import { PaymentStatsService } from './services/payment-stats.service';
import { PaymentController, AdminPaymentController } from './payment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), UsersModule, SubscriptionModule, EventBusModule],
  controllers: [PaymentController, AdminPaymentController],
  providers: [PaymentService, PaymentStatsService, DemoAuthGuard],
  exports: [PaymentService],
})
export class PaymentModule {}
