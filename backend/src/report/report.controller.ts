import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('reports')
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

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    if (request.user!.role !== 'admin') {
      throw new ForbiddenException('Chỉ admin mới có quyền xem báo cáo');
    }
    return this.reportService.findAllForAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    if (request.user!.role !== 'admin') {
      throw new ForbiddenException('Chỉ admin mới có quyền xem báo cáo');
    }
    return this.reportService.findOneForAdmin(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: Parameters<ReportService['updateStatus']>[1],
    @Req() request: AuthenticatedRequest,
  ) {
    if (request.user!.role !== 'admin') {
      throw new ForbiddenException('Chỉ admin mới có quyền cập nhật báo cáo');
    }
    return this.reportService.updateStatus(id, body, request.user!.id);
  }
}
