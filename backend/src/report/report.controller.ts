import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
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

@Controller('v1/admin/reports')
@UseGuards(DemoAuthGuard)
export class AdminReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('stats')
  async getStats(@Req() request: AuthenticatedRequest) {
    this.assertAdmin(request);
    const reports = await this.reportService.findAllForAdmin();
    const reportsByCategory = reports.reduce<Record<string, number>>(
      (stats, report) => {
        stats[report.reason] = (stats[report.reason] ?? 0) + 1;
        return stats;
      },
      {},
    );

    return {
      totalReports: reports.length,
      pendingReports: reports.filter((report) => report.status === 'pending')
        .length,
      reviewedReports: reports.filter((report) => report.status === 'reviewed')
        .length,
      resolvedReports: reports.filter((report) => report.status === 'resolved')
        .length,
      rejectedReports: reports.filter((report) => report.status === 'rejected')
        .length,
      reportsByCategory,
    };
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    this.assertAdmin(request);
    return this.reportService.findAllForAdmin();
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
    if (request.user!.role !== 'admin') {
      throw new ForbiddenException('Chi admin moi co quyen quan ly bao cao');
    }
  }
}
