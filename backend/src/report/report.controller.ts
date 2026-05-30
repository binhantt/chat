import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UserRole } from '../users/entities/user.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportService } from './report.service';

@Controller('v1/reports')
@UseGuards(DemoAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  create(@Body() dto: CreateReportDto, @Req() request: AuthenticatedRequest) {
    return this.reportService.create(request.user!.id, dto);
  }

  @Get('reportable-users')
  findReportableUsers(@Req() request: AuthenticatedRequest) {
    return this.reportService.getReportableUsers(request.user!.id);
  }

  @Get('my-reports')
  findMyReports(@Req() request: AuthenticatedRequest) {
    return this.reportService.findMyReports(request.user!.id);
  }
}

@Controller('v1/manager/reports')
@UseGuards(DemoAuthGuard)
export class AdminReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('stats')
  async getStats(@Req() request: AuthenticatedRequest) {
    this.assertAdmin(request);
    return this.reportService.getAdminStats();
  }

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('status') status?: string,
  ) {
    this.assertAdmin(request);
    return this.reportService.findAllForAdmin({
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    this.assertAdmin(request);
    return this.reportService.findOneForAdmin(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: Parameters<ReportService['updateStatus']>[1],
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertAdmin(request);
    return this.reportService.updateStatus(id, body, request.user!.id);
  }

  private assertAdmin(request: AuthenticatedRequest) {
    if (request.user!.role !== UserRole.Admin) {
      throw new ForbiddenException('Chi admin moi co quyen quan ly bao cao');
    }
  }
}
