import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { MatchModule } from './match/match.module';
import { ReportModule } from './report/report.module';
import { ConductModule } from './conduct/conduct.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EventBusModule } from './common/events/event-bus.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { PaymentModule } from './payment/payment.module';
import { AdModule } from './ad/ad.module';
import { SeppayModule } from './seppay/seppay.module';
import { SupabaseModule } from './supabase/supabase.module';
import { UploadModule } from './upload/upload.module';
import { AiModule } from './ai/ai.module';
import { createPostgresConfig } from './database/postgres.config';
import { PerformanceIndexService } from './database/performance-index.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(createPostgresConfig()),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60_000,
          limit: 500,
        },
        {
          name: 'guest-login',
          ttl: 60_000,
          limit: 10,
        },
        {
          name: 'chat-message',
          ttl: 60_000,
          limit: 120,
        },
      ],
      storage: undefined,
    }),
    AuthModule,
    UsersModule,
    ChatModule,
    MatchModule,
    ReportModule,
    ConductModule,
    AnalyticsModule,
    EventBusModule,
    SubscriptionModule,
    PaymentModule,
    AdModule,
    SeppayModule,
    SupabaseModule,
    UploadModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PerformanceIndexService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
