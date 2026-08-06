import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UserRole } from '../users/entities/user.entity';
import { AdService } from './ad.service';
import { AdTrackerService } from './services/ad-tracker.service';
import { CreateAdDto, UpdateAdStatusDto } from './dto/create-ad.dto';

@Controller('v1/ad')
@UseGuards(DemoAuthGuard)
export class AdController {
  constructor(private readonly adService: AdService) {}

  @Post()
  createAd(
    @Body() dto: CreateAdDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adService.createAd(request.user!.id, dto);
  }

  @Get('my')
  getMyAds(@Req() request: AuthenticatedRequest) {
    return this.adService.getUserAds(request.user!.id);
  }
}

@Controller('v1/ad/public')
export class PublicAdController {
  constructor(private readonly adService: AdService) {}

  @Get('active')
  getActiveAds() {
    return this.adService.getActiveAds();
  }
}

@Controller('v1/ad')
export class AdTrackingController {
  constructor(private readonly adTracker: AdTrackerService) {}

  @Post(':id/impression')
  trackImpression(
    @Param('id') id: string,
    @Req() req: any,
    @Headers('user-agent') ua?: string,
  ) {
    const ip = req.ip ?? req.connection?.remoteAddress;
    return this.adTracker.trackImpression(id, ip, ua);
  }

  @Post(':id/click')
  trackClick(
    @Param('id') id: string,
    @Req() req: any,
    @Headers('user-agent') ua?: string,
  ) {
    const ip = req.ip ?? req.connection?.remoteAddress;
    return this.adTracker.trackClick(id, ip, ua);
  }
}

@Controller('v1/manager/ad')
@UseGuards(DemoAuthGuard)
export class AdminAdController {
  constructor(private readonly adService: AdService) {}

  private checkAdmin(request: AuthenticatedRequest) {
    if (request.user?.role !== UserRole.Admin) {
      throw new ForbiddenException('Chi admin moi co quyen');
    }
  }

  @Get()
  getAll(@Req() request: AuthenticatedRequest) {
    this.checkAdmin(request);
    return this.adService.getAllAds();
  }

  @Get('stats')
  getStats(@Req() request: AuthenticatedRequest) {
    this.checkAdmin(request);
    return this.adService.getAdStats();
  }

  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAdStatusDto,
    @Req() request: AuthenticatedRequest,
  ) {
    this.checkAdmin(request);
    return this.adService.updateAdStatus(id, dto);
  }

  @Get(':id')
  getDetail(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.checkAdmin(request);
    return this.adService.getAdDetail(id);
  }
}
