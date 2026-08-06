import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JoinMatchHandler } from './commands/handlers/join-match.handler';
import { LeaveMatchHandler } from './commands/handlers/leave-match.handler';
import { GetMatchStatusHandler } from './queries/handlers/get-match-status.handler';
import { MatchService } from './match.service';
import { SpeedBoostService } from './services/speed-boost.service';

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
    private readonly matchService: MatchService,
    private readonly speedBoostService: SpeedBoostService,
  ) {}

  @Post('join')
  async joinQueue(
    @Req() request: AuthenticatedRequest,
    @Body() dto?: JoinMatchDto,
  ) {
    const userId = request.user!.id;

    // Check cooldown before allowing join
    const cooldownMs = await this.speedBoostService.getCooldownRemaining(userId);
    if (cooldownMs > 0) {
      throw new HttpException(
        {
          message: `Vui lòng chờ ${Math.ceil(cooldownMs / 1000)} giây trước khi tìm kiếm lại`,
          cooldownRemainingMs: cooldownMs,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return this.joinMatchHandler.execute({
      userId,
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

  @Get('online')
  async getOnlineCount() {
    const count = await this.matchService.getOnlineCount();
    return { count };
  }

  // ── Speed-boost endpoints ──

  /**
   * User watches an ad and claims a speed boost (collective mechanic).
   */
  @Post('speed-boost')
  async claimBoost(@Req() request: AuthenticatedRequest) {
    const result = await this.speedBoostService.claimBoost(request.user!.id);
    return result;
  }

  /**
   * Get current speed-boost status (cooldown, boost window, collective count).
   */
  @Get('speed-boost')
  async getBoostStatus(@Req() request: AuthenticatedRequest) {
    return this.speedBoostService.getBoostStatus(request.user!.id);
  }
}
