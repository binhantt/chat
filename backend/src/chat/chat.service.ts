import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  Conversation,
  ConversationStatus,
} from './entities/conversation.entity';
import { Message, MessageStatus } from './entities/message.entity';
import { Report, ReportStatus } from '../report/entities/report.entity';
import { AuthTokenService } from '../auth/services/auth-token.service';
import { ChatRealtimeService } from './chat-realtime.service';
import { ConductService } from '../conduct/conduct.service';
import {
  MatchQueue,
  MatchQueueStatus,
} from '../match/entities/match-queue.entity';
import { AiChatService } from '../ai/ai-chat.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ChatService implements OnModuleInit {
  private readonly logger = new Logger(ChatService.name);
  private readonly messageRetentionDays = 90;
  private readonly AI_BOT_EMAIL = 'bot@nguoila.online';

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(MatchQueue)
    private readonly matchQueueRepository: Repository<MatchQueue>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authTokenService: AuthTokenService,
    private readonly chatRealtimeService: ChatRealtimeService,
    private readonly conductService: ConductService,
    private readonly aiChatService: AiChatService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureConversationConsentColumns();
    void this.deleteExpiredMessages();
  }

  private async ensureConversationConsentColumns(): Promise<void> {
    await this.conversationRepository.query(
      'ALTER TABLE conversations ADD COLUMN IF NOT EXISTS "user1Accepted" boolean NOT NULL DEFAULT false',
    );
    await this.conversationRepository.query(
      'ALTER TABLE conversations ADD COLUMN IF NOT EXISTS "user2Accepted" boolean NOT NULL DEFAULT false',
    );
  }

  private readonly endedConversationRetentionDays = 30;
  private readonly chatHistoryRetentionDays = 30;

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredMessages(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.messageRetentionDays);

    const result = await this.messageRepository.delete({
      createdAt: LessThan(cutoffDate),
    });
    const deletedCount = result.affected ?? 0;

    if (deletedCount > 0) {
      this.logger.log(
        `Deleted ${deletedCount} chat messages older than ${this.messageRetentionDays} days`,
      );
    }

    return deletedCount;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredConversations(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.endedConversationRetentionDays);

    // Find ended conversations that have been inactive for the retention period
    const expiredConversations = await this.conversationRepository.find({
      where: {
        status: ConversationStatus.Ended,
        updatedAt: LessThan(cutoffDate),
      },
      select: ['id'],
    });

    if (expiredConversations.length === 0) {
      return 0;
    }

    const ids = expiredConversations.map((c) => c.id);

    // Delete associated messages first
    const messageResult = await this.messageRepository.delete({
      conversationId: In(ids),
    });
    const deletedMessages = messageResult.affected ?? 0;

    // Then delete the conversations
    const conversationResult = await this.conversationRepository.delete(ids);
    const deletedConversations = conversationResult.affected ?? 0;

    this.logger.log(
      `Deleted ${deletedConversations} ended conversations and ${deletedMessages} messages (idle >${this.endedConversationRetentionDays} days)`,
    );

    return deletedConversations;
  }

  /**
   * Xóa lịch sử chat (messages) của conversations đã cũ (>30 ngày)
   * - Nếu KHÔNG có report pending nào → xóa messages ngay
   * - Nếu CÓ report pending → đợi admin resolve/reject rồi mới xóa
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteChatHistoryAfterRetention(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.chatHistoryRetentionDays);

    // Tìm conversations vẫn active hoặc ended nhưng chưa bị xóa
    const oldConversations = await this.conversationRepository.find({
      where: [
        { updatedAt: LessThan(cutoffDate), status: ConversationStatus.Active },
        { updatedAt: LessThan(cutoffDate), status: ConversationStatus.Ended },
        { updatedAt: LessThan(cutoffDate), status: ConversationStatus.Blocked },
      ],
      select: ['id', 'user1Id', 'user2Id', 'status', 'updatedAt'],
    });

    if (oldConversations.length === 0) {
      return 0;
    }

    let totalDeletedMessages = 0;

    for (const conv of oldConversations) {
      // Kiểm tra có report pending nào cho user1 hoặc user2 không
      const hasPendingReports = await this.reportRepository
        .createQueryBuilder('report')
        .where(
          '(report.reportedUserId = :user1 OR report.reportedUserId = :user2)',
          { user1: conv.user1Id, user2: conv.user2Id },
        )
        .andWhere('report.status = :status', {
          status: ReportStatus.Pending,
        })
        .getCount();

      // Nếu có report pending → bỏ qua, đợi admin resolve
      if (hasPendingReports > 0) {
        this.logger.log(
          `Skipping chat history deletion for conversation ${conv.id}: ${hasPendingReports} pending report(s)`,
        );
        continue;
      }

      // Không có report pending → xóa messages của conversation này
      const result = await this.messageRepository.delete({
        conversationId: conv.id,
      });
      const deletedCount = result.affected ?? 0;

      if (deletedCount > 0) {
        totalDeletedMessages += deletedCount;
        this.logger.log(
          `Deleted ${deletedCount} messages from conversation ${conv.id} (no pending reports)`,
        );
      }
    }

    if (totalDeletedMessages > 0) {
      this.logger.log(
        `Chat history cleanup: deleted ${totalDeletedMessages} messages from ${oldConversations.length} conversations (>${this.chatHistoryRetentionDays} days, no pending reports)`,
      );
    }

    return totalDeletedMessages;
  }

  async findConversationById(
    conversationId: string,
    userId: string,
    isAdmin = false,
  ): Promise<Conversation> {
    const conversation = await this.createConversationListQuery()
      .where('conversation.id = :conversationId', { conversationId })
      .getOne();

    if (!conversation) {
      throw new NotFoundException('Không tìm thấy cuộc trò chuyện');
    }

    if (
      !isAdmin &&
      conversation.user1Id !== userId &&
      conversation.user2Id !== userId
    ) {
      throw new ForbiddenException(
        'Ban khong co quyen xem cuoc tro chuyen nay',
      );
    }

    if (!isAdmin && conversation.status !== ConversationStatus.Active) {
      throw new ForbiddenException('Cuoc tro chuyen da ket thuc');
    }

    return conversation;
  }

  async getUserConversations(
    userId: string,
    limit = 20,
    offset = 0,
    cursor?: string,
  ): Promise<Conversation[]> {
    // Check if user is banned before returning conversations
    if (this.authTokenService.isUserBanned(userId)) {
      return [];
    }

    const query = this.createConversationListQuery()
      .where('conversation.status = :status', {
        status: ConversationStatus.Active,
      })
      .andWhere(
        '(conversation.user1Id = :userId OR conversation.user2Id = :userId)',
        { userId },
      )
      .orderBy('conversation.updatedAt', 'DESC')
      .addOrderBy('conversation.id', 'DESC')
      .take(Math.min(Math.max(limit, 1), 50));

    const decodedCursor = this.decodeConversationCursor(cursor);
    if (decodedCursor) {
      query.andWhere(
        '(conversation.updatedAt < :updatedAt OR (conversation.updatedAt = :updatedAt AND conversation.id < :id))',
        decodedCursor,
      );
    } else if (offset > 0) {
      query.skip(Math.max(offset, 0));
    }

    return query.getMany();
  }

  async getAdminConversations({
    cursor,
    limit = 50,
    status,
  }: {
    cursor?: string;
    limit?: number;
    status?: ConversationStatus;
  } = {}): Promise<{
    items: Conversation[];
    limit: number;
    nextCursor: string | null;
    stats: {
      active: number;
      blocked: number;
      ended: number;
      total: number;
    };
  }> {
    const safeLimit = Math.min(Math.max(limit || 50, 1), 100);
    const query = this.createConversationListQuery()
      .orderBy('conversation.updatedAt', 'DESC')
      .addOrderBy('conversation.id', 'DESC')
      .take(safeLimit + 1);

    if (status) {
      query.where('conversation.status = :status', { status });
    }

    const decodedCursor = this.decodeConversationCursor(cursor);
    if (decodedCursor) {
      const condition =
        '(conversation.updatedAt < :updatedAt OR (conversation.updatedAt = :updatedAt AND conversation.id < :id))';
      if (status) {
        query.andWhere(condition, decodedCursor);
      } else {
        query.where(condition, decodedCursor);
      }
    }

    const [rows, stats] = await Promise.all([
      query.getMany(),
      this.getAdminConversationStats(),
    ]);
    const items = rows.slice(0, safeLimit);
    const nextCursor =
      rows.length > safeLimit
        ? this.encodeConversationCursor(items[items.length - 1])
        : null;

    return {
      items,
      limit: safeLimit,
      nextCursor,
      stats,
    };
  }

  private async getAdminConversationStats(): Promise<{
    active: number;
    blocked: number;
    ended: number;
    total: number;
  }> {
    const rows = await this.conversationRepository
      .createQueryBuilder('conversation')
      .select('conversation.status', 'status')
      .addSelect('COUNT(conversation.id)', 'count')
      .groupBy('conversation.status')
      .getRawMany<{ status: ConversationStatus; count: string }>();

    const stats = {
      active: 0,
      blocked: 0,
      ended: 0,
      total: 0,
    };

    for (const row of rows) {
      const count = Number(row.count) || 0;
      stats.total += count;

      if (row.status === ConversationStatus.Active) {
        stats.active = count;
      } else if (row.status === ConversationStatus.Blocked) {
        stats.blocked = count;
      } else if (row.status === ConversationStatus.Ended) {
        stats.ended = count;
      }
    }

    return stats;
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

    if (
      conversation.user1Id !== senderId &&
      conversation.user2Id !== senderId
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này',
      );
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
      throw new ForbiddenException(
        'Bạn đã bị cấm sử dụng chat stream' +
          ' (vi phạm quá giới hạn trong 1 ngày)',
      );
    }

    const conductCheck = await this.conductService.checkMessage(content);
    if (conductCheck.violated) {
      throw new ForbiddenException('Không thể nhắn tin vì đã vi phạm ứng xử');
    }

    const message = this.messageRepository.create({
      conversationId,
      senderId,
      content,
      status: MessageStatus.Sent,
    });

    const savedMessage = await this.messageRepository.save(message);

    await this.conversationRepository.update(conversation.id, {
      updatedAt: new Date(),
    });

    this.chatRealtimeService.emitMessage(
      [conversation.user1Id, conversation.user2Id],
      savedMessage,
    );
    this.logger.log(
      `Message created: ${savedMessage.id} in conversation ${conversationId}`,
    );

    // Check if this is a conversation with the AI bot
    const isAiConversation = await this.isAiConversation(conversation);
    if (isAiConversation) {
      // Don't generate reply if the bot sent the message
      const senderIsBot = senderId !== conversation.user1Id;
      if (!senderIsBot) {
        await this.generateAiReply(conversation, conversation.user1Id);
      }
    }

    return savedMessage;
  }

  private async isAiConversation(conversation: Conversation): Promise<boolean> {
    const botUser = await this.userRepository.findOne({
      where: { email: this.AI_BOT_EMAIL },
    });
    if (!botUser) return false;
    return conversation.user2Id === botUser.id;
  }

  private async generateAiReply(conversation: Conversation, humanUserId: string): Promise<void> {
    try {
      const shouldReply = await this.aiChatService.shouldReply(conversation.id);
      if (!shouldReply) return;

      // Get recent messages for context
      const recentMessages = await this.messageRepository.find({
        where: { conversationId: conversation.id },
        order: { createdAt: 'DESC' },
        take: 10,
      });

      const history = recentMessages.reverse().map((m) => ({
        role: m.senderId === humanUserId ? 'user' : 'assistant',
        content: m.content,
      }));

      const lastUserMessage = recentMessages.find((m) => m.senderId === humanUserId);
      if (!lastUserMessage) return;

      const reply = await this.aiChatService.generateReply(lastUserMessage.content, history);
      if (!reply) return;

      const botUser = await this.userRepository.findOne({
        where: { email: this.AI_BOT_EMAIL },
      });
      if (!botUser) return;

      const botMessage = this.messageRepository.create({
        conversationId: conversation.id,
        senderId: botUser.id,
        content: reply,
        status: MessageStatus.Sent,
      });

      const savedBotMessage = await this.messageRepository.save(botMessage);

      await this.conversationRepository.update(conversation.id, {
        updatedAt: new Date(),
      });

      this.chatRealtimeService.emitMessage(
        [conversation.user1Id, conversation.user2Id],
        savedBotMessage,
      );

      this.logger.log(`AI reply sent in conversation ${conversation.id}`);
    } catch (error) {
      this.logger.error('Failed to generate AI reply', error);
    }
  }

  async getConversationMessages(
    conversationId: string,
    userId: string,
    limit: number = 50,
    offset: number = 0,
    isAdmin = false,
    cursor?: string,
  ): Promise<Message[]> {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId },
      });

      if (!conversation) {
        throw new NotFoundException('Không tìm thấy cuộc trò chuyện');
      }

      if (
        !isAdmin &&
        conversation.user1Id !== userId &&
        conversation.user2Id !== userId
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền xem cuộc trò chuyện này',
        );
      }

      if (!isAdmin && conversation.status !== ConversationStatus.Active) {
        throw new ForbiddenException('Cuoc tro chuyen da ket thuc');
      }

      return this.findMessages({ conversationId, cursor, limit, offset });
    } catch (error) {
      this.logger.error(
        `Error fetching messages for conversation ${conversationId}:`,
        error,
      );
      throw error;
    }
  }

  async getConversationMessagesForAdmin(
    conversationId: string,
    limit: number = 100,
    offset: number = 0,
    cursor?: string,
  ): Promise<Message[]> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('KhÃ´ng tÃ¬m tháº¥y cuá»™c trÃ² chuyá»‡n');
    }

    return this.findMessages({
      conversationId,
      cursor,
      includeSender: true,
      limit,
      offset,
    });
  }

  private findMessages({
    conversationId,
    cursor,
    includeSender = false,
    limit,
    offset,
  }: {
    conversationId: string;
    cursor?: string;
    includeSender?: boolean;
    limit: number;
    offset: number;
  }): Promise<Message[]> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .select([
        'message.id',
        'message.conversationId',
        'message.senderId',
        'message.content',
        'message.status',
        'message.createdAt',
      ])
      .where('message.conversationId = :conversationId', { conversationId })
      .orderBy('message.createdAt', 'DESC')
      .addOrderBy('message.id', 'DESC')
      .take(Math.min(Math.max(limit, 1), 100));

    if (includeSender) {
      query
        .leftJoinAndSelect('message.sender', 'sender')
        .addSelect([
          'sender.id',
          'sender.email',
          'sender.fullName',
          'sender.avatarUrl',
        ]);
    }

    const decodedCursor = this.decodeMessageCursor(cursor);
    if (decodedCursor) {
      query.andWhere(
        '(message.createdAt < :createdAt OR (message.createdAt = :createdAt AND message.id < :id))',
        decodedCursor,
      );
    } else if (offset > 0) {
      query.skip(Math.max(offset, 0));
    }

    return query.getMany();
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
      throw new ForbiddenException(
        'Bạn không có quyền trong cuộc trò chuyện này',
      );
    }

    const otherUserId =
      conversation.user1Id === userId
        ? conversation.user2Id
        : conversation.user1Id;

    await this.messageRepository.update(
      {
        conversationId,
        senderId: otherUserId,
        status: MessageStatus.Sent,
      },
      { status: MessageStatus.Read },
    );

    this.logger.log(
      `Messages marked as read: conversation ${conversationId} for user ${userId}`,
    );
  }

  async notifyTyping(
    conversationId: string,
    userId: string,
    isTyping: boolean,
  ): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Không tìm thấy cuộc trò chuyện');
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền trong cuộc trò chuyện này',
      );
    }

    if (conversation.status !== ConversationStatus.Active) {
      return;
    }

    const receiverId =
      conversation.user1Id === userId
        ? conversation.user2Id
        : conversation.user1Id;

    this.chatRealtimeService.emitTyping(
      [receiverId],
      conversation.id,
      userId,
      isTyping,
    );
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
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa cuộc trò chuyện này',
      );
    }

    if (conversation.user1Id === userId) {
      conversation.user1Blocked = true;
    } else {
      conversation.user2Blocked = true;
    }

    conversation.status = ConversationStatus.Blocked;
    conversation.updatedAt = new Date();
    const savedConversation =
      await this.conversationRepository.save(conversation);
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
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa cuộc trò chuyện này',
      );
    }

    conversation.status = ConversationStatus.Ended;
    conversation.updatedAt = new Date();

    const savedConversation =
      await this.conversationRepository.save(conversation);

    await this.matchQueueRepository.update(
      { conversationId: conversation.id },
      { status: MatchQueueStatus.Cancelled },
    );

    this.chatRealtimeService.emitConversationEnded(
      [conversation.user1Id, conversation.user2Id],
      conversation.id,
      userId,
    );

    return savedConversation;
  }

  async acceptConversation(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['user1', 'user2'],
    });

    if (!conversation) {
      throw new NotFoundException('Khong tim thay cuoc tro chuyen');
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new ForbiddenException(
        'Ban khong co quyen xac nhan cuoc tro chuyen nay',
      );
    }

    if (conversation.status !== ConversationStatus.Active) {
      throw new ForbiddenException('Cuoc tro chuyen da bi dong');
    }

    if (conversation.user1Id === userId) {
      conversation.user1Accepted = true;
    } else {
      conversation.user2Accepted = true;
    }

    conversation.updatedAt = new Date();
    const savedConversation =
      await this.conversationRepository.save(conversation);

    this.chatRealtimeService.emitConversationAccepted(
      [conversation.user1Id, conversation.user2Id],
      conversation.id,
      userId,
      this.isConversationAccepted(savedConversation),
    );

    return savedConversation;
  }

  private isConversationAccepted(conversation: Conversation): boolean {
    return (
      conversation.user1Accepted === true && conversation.user2Accepted === true
    );
  }

  private createConversationListQuery() {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.user1', 'user1')
      .leftJoinAndSelect('conversation.user2', 'user2')
      .select([
        'conversation.id',
        'conversation.user1Id',
        'conversation.user2Id',
        'conversation.status',
        'conversation.user1Accepted',
        'conversation.user2Accepted',
        'conversation.createdAt',
        'conversation.updatedAt',
        'user1.id',
        'user1.email',
        'user1.fullName',
        'user1.avatarUrl',
        'user1.gender',
        'user1.city',
        'user1.dateOfBirth',
        'user1.phoneNumber',
        'user1.bio',
        'user2.id',
        'user2.email',
        'user2.fullName',
        'user2.avatarUrl',
        'user2.gender',
        'user2.city',
        'user2.dateOfBirth',
        'user2.phoneNumber',
        'user2.bio',
      ]);
  }

  private encodeConversationCursor(conversation: Conversation): string {
    return Buffer.from(
      JSON.stringify({
        id: conversation.id,
        updatedAt: conversation.updatedAt.toISOString(),
      }),
    ).toString('base64url');
  }

  private decodeConversationCursor(
    cursor?: string,
  ): { id: string; updatedAt: Date } | null {
    if (!cursor) return null;

    try {
      const parsed = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      ) as { id?: string; updatedAt?: string };
      if (!parsed.id || !parsed.updatedAt) return null;

      const updatedAt = new Date(parsed.updatedAt);
      if (Number.isNaN(updatedAt.getTime())) return null;

      return { id: parsed.id, updatedAt };
    } catch {
      return null;
    }
  }

  private decodeMessageCursor(
    cursor?: string,
  ): { createdAt: Date; id: string } | null {
    if (!cursor) return null;

    try {
      const parsed = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      ) as { createdAt?: string; id?: string };
      if (!parsed.createdAt || !parsed.id) return null;

      const createdAt = new Date(parsed.createdAt);
      if (Number.isNaN(createdAt.getTime())) return null;

      return { createdAt, id: parsed.id };
    } catch {
      return null;
    }
  }
}
