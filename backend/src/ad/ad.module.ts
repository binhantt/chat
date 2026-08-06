import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import { UsersModule } from '../users/users.module';
import { EventBusModule } from '../common/events/event-bus.module';
import { Ad } from './entities/ad.entity';
import { AdStats } from './entities/ad-stats.entity';
import { AdService } from './ad.service';
import { AdTrackerService } from './services/ad-tracker.service';
import { AdController, AdTrackingController, AdminAdController, PublicAdController } from './ad.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ad, AdStats]), UsersModule, EventBusModule],
  controllers: [AdController, AdTrackingController, AdminAdController, PublicAdController],
  providers: [AdService, AdTrackerService, DemoAuthGuard],
  exports: [AdService],
})
export class AdModule {}
