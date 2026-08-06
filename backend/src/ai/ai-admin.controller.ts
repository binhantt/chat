import { Controller, Get, Patch, Post, Body, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import { AiChatService } from './ai-chat.service';
import { UpdateAiSettingsDto } from './dto/update-ai-settings.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UserRole } from '../users/entities/user.entity';

@Controller('v1/manager/ai')
@UseGuards(DemoAuthGuard)
export class AiAdminController {
  constructor(private readonly aiChatService: AiChatService) {}

  private assertAdmin(request: AuthenticatedRequest): void {
    if (!request.user || request.user.role !== UserRole.Admin) {
      throw new ForbiddenException('Bạn không có quyền truy cập tính năng này');
    }
  }

  @Get('settings')
  async getSettings(@Req() request: AuthenticatedRequest) {
    this.assertAdmin(request);
    const settings = await this.aiChatService.getSettings();
    return settings || { enabled: false, model: 'llama-3.3-70b-versatile', replyFrequency: 10, botName: 'Minh Anh' };
  }

  @Patch('settings')
  async updateSettings(@Req() request: AuthenticatedRequest, @Body() dto: UpdateAiSettingsDto) {
    this.assertAdmin(request);
    return this.aiChatService.updateSettings(dto);
  }

  @Post('test')
  async testConnection(@Req() request: AuthenticatedRequest) {
    this.assertAdmin(request);
    return this.aiChatService.testConnection();
  }
}
