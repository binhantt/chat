import { Controller, Post, Get, Delete, Req, UseGuards } from '@nestjs/common';
import { MatchService } from './match.service';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('match')
@UseGuards(DemoAuthGuard)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post('join')
  async joinQueue(@Req() request: AuthenticatedRequest) {
    return this.matchService.joinQueue(request.user!.id);
  }

  @Delete('leave')
  async leaveQueue(@Req() request: AuthenticatedRequest) {
    await this.matchService.leaveQueue(request.user!.id);
    return { message: 'Đã rời hàng đợi tìm kiếm' };
  }

  @Get('status')
  async getStatus(@Req() request: AuthenticatedRequest) {
    return this.matchService.getQueueStatusResponse(request.user!.id);
  }
}
