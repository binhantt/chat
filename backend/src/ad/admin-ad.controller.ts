import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UserRole } from '../users/entities/user.entity';
import { AdService } from './ad.service';
import { UpdateAdStatusDto } from './dto/create-ad.dto';

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
