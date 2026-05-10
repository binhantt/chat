import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('chat')
@UseGuards(DemoAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@Req() request: AuthenticatedRequest) {
    return this.chatService.getUserConversations(request.user!.id);
  }

  @Get('conversations/:id')
  async getConversation(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.chatService.findConversationById(id);
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Req() request: AuthenticatedRequest,
  ) {
    return this.chatService.createMessage(id, request.user!.id, body.content);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.chatService.getConversationMessages(
      id,
      request.user!.id,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  @Patch('conversations/:id/read')
  async markAsRead(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    await this.chatService.markMessagesAsRead(id, request.user!.id);
    return { message: 'Đã đánh dấu tin nhắn là đã đọc' };
  }

  @Patch('conversations/:id/block')
  async blockConversation(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.chatService.blockConversation(id, request.user!.id);
  }

  @Patch('conversations/:id/end')
  async endConversation(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.chatService.endConversation(id, request.user!.id);
  }
}