import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UserRole } from '../users/entities/user.entity';
import { AnalyticsService } from './analytics.service';
import { TrackPageVisitDto } from './dto/track-page-visit.dto';

@Controller('v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('visit')
  trackPageVisit(@Body() body: TrackPageVisitDto, @Req() request: Request) {
    return this.analyticsService.trackPageVisit({
      path: body.path,
      request,
      visitorId: body.visitorId,
    });
  }
}

@Controller('v1/manager/analytics')
@UseGuards(DemoAuthGuard)
export class ManagerAnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('visits')
  getVisitStats(@Req() request: AuthenticatedRequest) {
    if (request.user?.role !== UserRole.Admin) {
      throw new ForbiddenException('Chi admin moi duoc xem thong ke truy cap');
    }

    return this.analyticsService.getVisitStats();
  }
}
