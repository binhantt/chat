import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import { UsersModule } from '../users/users.module';
import { PaymentModule } from '../payment/payment.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { SeppayService } from './seppay.service';
import { SeppayApiService } from './seppay-api.service';
import { SeppayController, SeppayIpnController, AdminSeppayController } from './seppay.controller';

@Module({
  imports: [TypeOrmModule.forFeature([]), UsersModule, PaymentModule, SubscriptionModule],
  controllers: [SeppayController, SeppayIpnController, AdminSeppayController],
  providers: [SeppayService, SeppayApiService, DemoAuthGuard],
  exports: [SeppayService],
})
export class SeppayModule {}
