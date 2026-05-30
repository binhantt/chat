import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import { UsersModule } from '../users/users.module';
import { PageVisit } from './entities/page-visit.entity';
import {
  AnalyticsController,
  ManagerAnalyticsController,
} from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([PageVisit]), UsersModule],
  controllers: [AnalyticsController, ManagerAnalyticsController],
  providers: [AnalyticsService, DemoAuthGuard],
})
export class AnalyticsModule {}
