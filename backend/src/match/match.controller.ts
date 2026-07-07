import { Controller, Post, Get, Delete, Body, Req, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JoinMatchHandler } from './commands/handlers/join-match.handler';
import { LeaveMatchHandler } from './commands/handlers/leave-match.handler';
import { GetMatchStatusHandler } from './queries/handlers/get-match-status.handler';

class JoinMatchDto {
  @IsOptional()
  @IsString()
  preferredGender?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  ageMin?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  ageMax?: number;
}

@Controller('v1/match')
@UseGuards(DemoAuthGuard)
export class MatchController {
  constructor(
    private readonly joinMatchHandler: JoinMatchHandler,
    private readonly leaveMatchHandler: LeaveMatchHandler,
    private readonly getMatchStatusHandler: GetMatchStatusHandler,
  ) {}

  @Post('join')
  async joinQueue(
    @Req() request: AuthenticatedRequest,
    @Body() dto?: JoinMatchDto,
  ) {
    return this.joinMatchHandler.execute({
      userId: request.user!.id,
      preferredGender: dto?.preferredGender,
      city: dto?.city,
      ageMin: dto?.ageMin,
      ageMax: dto?.ageMax,
    });
  }

  @Delete('leave')
  async leaveQueue(@Req() request: AuthenticatedRequest) {
    await this.leaveMatchHandler.execute({ userId: request.user!.id });
    return { message: 'Đã rời hàng đợi tìm kiếm' };
  }

  @Get('status')
  async getStatus(@Req() request: AuthenticatedRequest) {
    return this.getMatchStatusHandler.execute({ userId: request.user!.id });
  }
}
