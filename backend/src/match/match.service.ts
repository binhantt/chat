import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MatchQueue, MatchQueueStatus } from './entities/match-queue.entity';
import { User, UserGender } from '../users/entities/user.entity';
import {
  Conversation,
  ConversationStatus,
} from '../chat/entities/conversation.entity';
import { ChatRealtimeService } from '../chat/chat-realtime.service';

export interface MatchStatusResponse {
  inQueue: boolean;
  status?: MatchQueueStatus;
  joinedAt?: Date;
  conversationId?: string | null;
  matchedWithUserId?: string | null;
  currentUserAccepted?: boolean;
  partnerAccepted?: boolean;
  chatReady?: boolean;
  matchedUser?: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    gender: UserGender | null;
    city: string | null;
  };
}

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);
  private readonly QUEUE_EXPIRY_MINUTES = 15;
  private readonly MATCH_RETRY_BATCH_SIZE = 100;
  private retryMatchingRunning = false;

  constructor(
    @InjectRepository(MatchQueue)
    private readonly matchQueueRepository: Repository<MatchQueue>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly chatRealtimeService: ChatRealtimeService,
  ) {}

  async joinQueue(userId: string): Promise<MatchQueue> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    if (!user.gender || !user.city) {
      throw new BadRequestException(
        'Vui lòng cập nhật thông tin giới tính và thành phố của bạn',
      );
    }

    await this.cancelActiveMatchForNewSearch(userId);

    const queue = this.matchQueueRepository.create({
      userId,
      gender: user.gender,
      city: user.city,
      status: MatchQueueStatus.Waiting,
      expiresAt: new Date(Date.now() + this.QUEUE_EXPIRY_MINUTES * 60 * 1000),
    });

    await this.matchQueueRepository.save(queue);
    this.logger.log(`User ${userId} joined match queue`);

    const match = await this.findMatch(queue);
    if (match) {
      const matchedQueue = await this.createMatch(queue, match);
      if (matchedQueue) {
        return matchedQueue;
      }
    }

    return queue;
  }

  async leaveQueue(userId: string): Promise<void> {
    await this.cancelQueueStateForUser(userId);
    this.logger.log(`User ${userId} left match queue`);
  }

  async getQueueStatusResponse(userId: string): Promise<MatchStatusResponse> {
    const status = await this.matchQueueRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!status) {
      return { inQueue: false };
    }

    const result: MatchStatusResponse = {
      inQueue: status.status === MatchQueueStatus.Waiting,
      status: status.status,
      joinedAt: status.createdAt,
    };

    if (
      status.status === MatchQueueStatus.Matched &&
      status.matchedWithUserId &&
      status.conversationId
    ) {
      const [conversation, matchedUser] = await Promise.all([
        this.conversationRepository.findOne({
          where: { id: status.conversationId },
        }),
        this.userRepository.findOne({
          select: {
            avatarUrl: true,
            city: true,
            email: true,
            fullName: true,
            gender: true,
            id: true,
          },
          where: { id: status.matchedWithUserId },
        }),
      ]);

      if (!conversation || conversation.status !== ConversationStatus.Active) {
        status.status = MatchQueueStatus.Cancelled;
        await this.matchQueueRepository.save(status);
        return {
          inQueue: false,
          status: MatchQueueStatus.Cancelled,
          joinedAt: status.createdAt,
        };
      }

      const currentUserAccepted =
        conversation?.user1Id === userId
          ? conversation.user1Accepted === true
          : conversation?.user2Accepted === true;
      const partnerAccepted =
        conversation?.user1Id === userId
          ? conversation.user2Accepted === true
          : conversation?.user1Accepted === true;
      const chatReady = currentUserAccepted && partnerAccepted;

      result.conversationId = status.conversationId;
      result.matchedWithUserId = status.matchedWithUserId;
      result.currentUserAccepted = currentUserAccepted;
      result.partnerAccepted = partnerAccepted;
      result.chatReady = chatReady;

      if (matchedUser) {
        result.matchedUser = {
          id: matchedUser.id,
          email: chatReady ? matchedUser.email : '',
          fullName: chatReady ? matchedUser.fullName : null,
          avatarUrl: chatReady ? matchedUser.avatarUrl : null,
          gender: matchedUser.gender,
          city: matchedUser.city,
        };
      }
    }

    return result;
  }

  private async cancelActiveMatchForNewSearch(
    userId: string,
    excludeQueueIds: string[] = [],
  ): Promise<void> {
    const activeConversations = await this.conversationRepository.find({
      where: [
        { user1Id: userId, status: ConversationStatus.Active },
        { user2Id: userId, status: ConversationStatus.Active },
      ],
      order: { updatedAt: 'DESC' },
    });

    if (activeConversations.length > 0) {
      const conversationIds = activeConversations.map(
        (conversation) => conversation.id,
      );

      await this.conversationRepository.update(
        { id: In(conversationIds) },
        { status: ConversationStatus.Ended, updatedAt: new Date() },
      );

      await this.matchQueueRepository.update(
        { conversationId: In(conversationIds) },
        { status: MatchQueueStatus.Cancelled },
      );
    }

    for (const conversation of activeConversations) {
      this.chatRealtimeService.emitConversationEnded(
        [conversation.user1Id, conversation.user2Id],
        conversation.id,
        userId,
      );
    }

    const query = this.matchQueueRepository
      .createQueryBuilder()
      .update(MatchQueue)
      .set({ status: MatchQueueStatus.Cancelled })
      .where('userId = :userId', { userId })
      .andWhere('status IN (:...statuses)', {
        statuses: [MatchQueueStatus.Waiting, MatchQueueStatus.Matched],
      });

    if (excludeQueueIds.length > 0) {
      query.andWhere('id NOT IN (:...excludeQueueIds)', { excludeQueueIds });
    }

    await query.execute();
  }

  private async cancelQueueStateForUser(userId: string): Promise<void> {
    await this.matchQueueRepository
      .createQueryBuilder()
      .update(MatchQueue)
      .set({ status: MatchQueueStatus.Cancelled })
      .where('userId = :userId', { userId })
      .andWhere('status IN (:...statuses)', {
        statuses: [MatchQueueStatus.Waiting, MatchQueueStatus.Matched],
      })
      .execute();
  }

  // Retry matching for all waiting users every 3 seconds
  @Interval(3000)
  async retryMatching() {
    if (this.retryMatchingRunning) {
      return;
    }

    this.retryMatchingRunning = true;
    const now = new Date();

    try {
      const expired = await this.matchQueueRepository
        .createQueryBuilder()
        .update(MatchQueue)
        .set({ status: MatchQueueStatus.Expired })
        .where('status = :status', { status: MatchQueueStatus.Waiting })
        .andWhere('expiresAt IS NOT NULL')
        .andWhere('expiresAt < :now', { now })
        .execute();

      if ((expired.affected ?? 0) > 0) {
        this.logger.log(`Expired ${expired.affected} stale match queues`);
      }

      const waitingQueues = await this.matchQueueRepository.find({
        where: { status: MatchQueueStatus.Waiting },
        order: { createdAt: 'ASC' },
        take: this.MATCH_RETRY_BATCH_SIZE,
      });

      const processedQueueIds = new Set<string>();
      const processedUserIds = new Set<string>();

      for (const queue of waitingQueues) {
        if (
          processedQueueIds.has(queue.id) ||
          processedUserIds.has(queue.userId)
        ) {
          continue;
        }

        const match = this.findMatchInBatch(
          queue,
          waitingQueues,
          processedQueueIds,
          processedUserIds,
        );
        if (match) {
          const matchedQueue = await this.createMatch(queue, match);
          if (matchedQueue) {
            processedQueueIds.add(queue.id);
            processedQueueIds.add(match.id);
            processedUserIds.add(queue.userId);
            processedUserIds.add(match.userId);
            this.logger.log(
              `Background match: ${matchedQueue.userId} <-> ${match.userId}`,
            );
          }
        }
      }
    } finally {
      this.retryMatchingRunning = false;
    }
  }

  private async findMatch(userQueue: MatchQueue): Promise<MatchQueue | null> {
    if (!userQueue.gender || !userQueue.city) {
      return null;
    }

    const preferredGenders = this.getPreferredGenders(userQueue.gender);
    return this.matchQueueRepository
      .createQueryBuilder('mq')
      .where('mq.status = :status', { status: MatchQueueStatus.Waiting })
      .andWhere('mq.userId != :userId', { userId: userQueue.userId })
      .andWhere('mq.gender IN (:...preferredGenders)', { preferredGenders })
      .andWhere('mq.city = :city', { city: userQueue.city })
      .andWhere('mq.expiresAt > :now', { now: new Date() })
      .addSelect(
        'CASE mq.gender ' +
          preferredGenders
            .map((gender, index) => `WHEN '${gender}' THEN ${index}`)
            .join(' ') +
          ' ELSE 99 END',
        'gender_rank',
      )
      .orderBy('gender_rank', 'ASC')
      .addOrderBy('mq.createdAt', 'ASC')
      .getOne();
  }

  private findMatchInBatch(
    userQueue: MatchQueue,
    waitingQueues: MatchQueue[],
    processedQueueIds: Set<string>,
    processedUserIds: Set<string>,
  ): MatchQueue | null {
    if (!userQueue.gender || !userQueue.city) {
      return null;
    }

    const preferredGenders = this.getPreferredGenders(userQueue.gender);
    const now = Date.now();

    for (const gender of preferredGenders) {
      const match = waitingQueues.find(
        (queue) =>
          queue.id !== userQueue.id &&
          queue.userId !== userQueue.userId &&
          !processedQueueIds.has(queue.id) &&
          !processedUserIds.has(queue.userId) &&
          queue.status === MatchQueueStatus.Waiting &&
          queue.gender === gender &&
          queue.city === userQueue.city &&
          (!queue.expiresAt || queue.expiresAt.getTime() > now),
      );

      if (match) {
        return match;
      }
    }

    return null;
  }

  private async createMatch(
    queue: MatchQueue,
    matchedQueue: MatchQueue,
  ): Promise<MatchQueue | null> {
    const [freshQueue, freshMatchedQueue] = await Promise.all([
      this.matchQueueRepository.findOne({
        where: { id: queue.id, status: MatchQueueStatus.Waiting },
      }),
      this.matchQueueRepository.findOne({
        where: { id: matchedQueue.id, status: MatchQueueStatus.Waiting },
      }),
    ]);

    if (!freshQueue || !freshMatchedQueue) {
      return null;
    }

    const activeQueueIds = [freshQueue.id, freshMatchedQueue.id];
    await this.cancelActiveMatchForNewSearch(freshQueue.userId, activeQueueIds);
    await this.cancelActiveMatchForNewSearch(
      freshMatchedQueue.userId,
      activeQueueIds,
    );

    const conversation = this.conversationRepository.create({
      user1Id: freshQueue.userId,
      user2Id: freshMatchedQueue.userId,
      status: ConversationStatus.Active,
      user1Accepted: false,
      user2Accepted: false,
    });

    const savedConversation =
      await this.conversationRepository.save(conversation);

    freshQueue.status = MatchQueueStatus.Matched;
    freshQueue.matchedWithUserId = freshMatchedQueue.userId;
    freshQueue.conversationId = savedConversation.id;
    await this.matchQueueRepository.save(freshQueue);

    freshMatchedQueue.status = MatchQueueStatus.Matched;
    freshMatchedQueue.matchedWithUserId = freshQueue.userId;
    freshMatchedQueue.conversationId = savedConversation.id;
    await this.matchQueueRepository.save(freshMatchedQueue);

    this.chatRealtimeService.emitConversationCreated(
      [freshQueue.userId, freshMatchedQueue.userId],
      savedConversation,
    );

    this.logger.log(
      `Match created: ${freshQueue.userId} <-> ${freshMatchedQueue.userId}`,
    );

    return freshQueue;
  }

  private getPreferredGenders(gender: UserGender): UserGender[] {
    switch (gender) {
      case UserGender.Male:
        return [UserGender.Female, UserGender.Male];
      case UserGender.Female:
        return [UserGender.Female, UserGender.Male];
      default:
        return [UserGender.Female, UserGender.Male];
    }
  }
}
