import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, ConversationStatus } from './entities/conversation.entity';
import { Message, MessageStatus } from './entities/message.entity';
import { AuthTokenService } from '../auth/services/auth-token.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async findConversationById(conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['user1', 'user2', 'messages', 'messages.sender'],
    });

    if (!conversation) {
      throw new NotFoundException('Không tìm thấy cuộc trò chuyện');
    }

    return conversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    // Check if user is banned before returning conversations
    if (this.authTokenService.isUserBanned(userId)) {
      return [];
    }

    return this.conversationRepository.find({
      where: [
        { user1Id: userId },
        { user2Id: userId },
      ],
      relations: ['user1', 'user2'],
      order: { updatedAt: 'DESC' },
    });
  }

  async createMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<Message> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Không tìm thấy cuộc trò chuyện');
    }

    if (conversation.user1Id !== senderId && conversation.user2Id !== senderId) {
      throw new ForbiddenException('Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này');
    }

    if (conversation.user1Blocked && conversation.user1Id === senderId) {
      throw new ForbiddenException('Bạn đã chặn cuộc trò chuyện này');
    }

    if (conversation.user2Blocked && conversation.user2Id === senderId) {
      throw new ForbiddenException('Bạn đã chặn cuộc trò chuyện này');
    }

    if (conversation.status !== ConversationStatus.Active) {
      throw new ForbiddenException('Cuộc trò chuyện đã bị đóng');
    }

    // Check if sender is banned
    if (this.authTokenService.isUserBanned(senderId)) {
      throw new ForbiddenException('Bạn đã bị cấm sử dụng chat stream'
        + ' (vi phạm quá giới hạn trong 1 ngày)');
    }

    const message = this.messageRepository.create({
      conversationId,
      senderId,
      content,
      status: MessageStatus.Sent,
    });

    const savedMessage = await this.messageRepository.save(message);

    conversation.updatedAt = new Date();
    await this.conversationRepository.save(conversation);
    this.logger.log(`Message created: ${savedMessage.id} in conversation ${conversationId}`);
    return savedMessage;
  }

  async getConversationMessages(
    conversationId: string,
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Message[]> {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId },
      });

      if (!conversation) {
        throw new NotFoundException('Không tìm thấy cuộc trò chuyện');
      }

      if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
        throw new ForbiddenException('Bạn không có quyền xem cuộc trò chuyện này');
      }

      return this.messageRepository.find({
        where: { conversationId },
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
        relations: ['sender'],
      });
    } catch (error) {
      this.logger.error(`Error fetching messages for conversation ${conversationId}:`, error);
      throw error;
    }
  }

  async markMessagesAsRead(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Không tìm thấy cuộc trò chuyện');
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new ForbiddenException('Bạn không có quyền trong cuộc trò chuyện này');
    }

    const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;

    await this.messageRepository.update(
      {
        conversationId,
        senderId: otherUserId,
        status: MessageStatus.Sent,
      },
      { status: MessageStatus.Read },
    );

    this.logger.log(`Messages marked as read: conversation ${conversationId} for user ${userId}`);
  }

  async blockConversation(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Không tìm thấy cuộc trò chuyện');
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa cuộc trò chuyện này');
    }

    if (conversation.user1Id === userId) {
      conversation.user1Blocked = true;
    } else {
      conversation.user2Blocked = true;
    }

    conversation.status = ConversationStatus.Blocked;
    conversation.updatedAt = new Date();
    const savedConversation = await this.conversationRepository.save(conversation);
    return savedConversation;
  }

  async endConversation(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Không tìm thấy cuộc trò chuyện');
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa cuộc trò chuyện này');
    }

    conversation.status = ConversationStatus.Ended;
    conversation.updatedAt = new Date();

    const savedConversation = await this.conversationRepository.save(conversation);

    return savedConversation;
  }
}