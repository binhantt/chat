import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatRealtimeService } from './chat-realtime.service';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UserRole } from '../users/entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { ConversationStatus } from './entities/conversation.entity';

@Controller('v1/chat')
@UseGuards(DemoAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatRealtimeService: ChatRealtimeService,
  ) {}

  @Get('stream')
  stream(@Req() request: AuthenticatedRequest, @Res() response: Response) {
    return this.chatRealtimeService.subscribe(request.user!.id, response);
  }

  @Get('conversations')
  async getConversations(
    @Req() request: AuthenticatedRequest,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.chatService.getUserConversations(
      request.user!.id,
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
      cursor,
    );
  }

  @Get('conversations/:id')
  async getConversation(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.chatService.findConversationById(
      id,
      request.user!.id,
      request.user!.role === UserRole.Admin,
    );
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Body() body: SendMessageDto,
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
    @Query('cursor') cursor?: string,
  ) {
    return this.chatService.getConversationMessages(
      id,
      request.user!.id,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
      request.user!.role === UserRole.Admin,
      cursor,
    );
  }

  @Patch('conversations/:id/read')
  async markAsRead(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.chatService.markMessagesAsRead(id, request.user!.id);
    return { message: 'Đã đánh dấu tin nhắn là đã đọc' };
  }

  @Patch('conversations/:id/typing')
  async typing(
    @Param('id') id: string,
    @Body() body: { isTyping?: boolean },
    @Req() request: AuthenticatedRequest,
  ) {
    await this.chatService.notifyTyping(
      id,
      request.user!.id,
      body.isTyping === true,
    );
    return { ok: true };
  }

  @Patch('conversations/:id/block')
  async blockConversation(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.chatService.blockConversation(id, request.user!.id);
  }

  @Patch('conversations/:id/end')
  async endConversation(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.chatService.endConversation(id, request.user!.id);
  }

  @Patch('conversations/:id/accept')
  async acceptConversation(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.chatService.acceptConversation(id, request.user!.id);
  }
}

@Controller('v1/manager/chats')
@UseGuards(DemoAuthGuard)
export class AdminChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getConversationsForAdmin(
    @Req() request: AuthenticatedRequest,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('status') status?: string,
  ) {
    if (request.user!.role !== UserRole.Admin) {
      throw new ForbiddenException('Chi admin moi duoc xem danh sach chat');
    }

    return this.chatService.getAdminConversations({
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
      status: Object.values(ConversationStatus).includes(
        status as ConversationStatus,
      )
        ? (status as ConversationStatus)
        : undefined,
    });
  }

  @Get(':id/messages')
  async getMessagesForAdmin(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('cursor') cursor?: string,
  ) {
    if (request.user!.role !== UserRole.Admin) {
      return this.chatService.getConversationMessages(
        id,
        request.user!.id,
        limit ? parseInt(limit) : 100,
        offset ? parseInt(offset) : 0,
        false,
        cursor,
      );
    }

    return this.chatService.getConversationMessagesForAdmin(
      id,
      limit ? parseInt(limit) : 100,
      offset ? parseInt(offset) : 0,
      cursor,
    );
  }
}
