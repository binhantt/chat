import {
  Injectable,
  Logger,
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
import { EventBusService } from './events/event-bus.service';
import { createMatchMatchedEvent } from './events/match-matched.event';
import { createMatchExpiredEvent } from './events/match-expired.event';
import { MatchQueueRepository } from './repositories/match-queue.repository';

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);
  readonly QUEUE_EXPIRY_MINUTES = 15;
  private readonly MATCH_RETRY_BATCH_SIZE = 100;
  private retryMatchingRunning = false;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly matchQueueRepository: MatchQueueRepository,
    private readonly chatRealtimeService: ChatRealtimeService,
    private readonly eventBus: EventBusService,
  ) {}

  // ── Public helpers called by command/query handlers ──

  async cancelActiveMatchForNewSearch(
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

      await this.matchQueueRepository.cancelByConversationIds(conversationIds);
    }

    for (const conversation of activeConversations) {
      this.chatRealtimeService.emitConversationEnded(
        [conversation.user1Id, conversation.user2Id],
        conversation.id,
        userId,
      );
    }

    await this.matchQueueRepository.cancelAllForUser(userId, excludeQueueIds);
  }

  async cancelQueueStateForUser(userId: string): Promise<void> {
    await this.matchQueueRepository.cancelAllForUser(userId);
  }

  async findMatch(userQueue: MatchQueue): Promise<MatchQueue | null> {
    if (!userQueue.gender || !userQueue.city) {
      return null;
    }

    const preferredGenders = this.getPreferredGenders(userQueue.gender, userQueue.preferredGender);
    return this.matchQueueRepository.findMatchWithCriteria(
      userQueue.userId,
      preferredGenders,
      userQueue.city,
      userQueue.ageMin,
      userQueue.ageMax,
    );
  }

  async createMatch(
    queue: MatchQueue,
    matchedQueue: MatchQueue,
  ): Promise<MatchQueue | null> {
    const [freshQueue, freshMatchedQueue] = await Promise.all([
      this.matchQueueRepository.findById(queue.id),
      this.matchQueueRepository.findById(matchedQueue.id),
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
    await this.matchQueueRepository.saveOne(freshQueue);

    freshMatchedQueue.status = MatchQueueStatus.Matched;
    freshMatchedQueue.matchedWithUserId = freshQueue.userId;
    freshMatchedQueue.conversationId = savedConversation.id;
    await this.matchQueueRepository.saveOne(freshMatchedQueue);

    this.chatRealtimeService.emitConversationCreated(
      [freshQueue.userId, freshMatchedQueue.userId],
      savedConversation,
    );

    this.eventBus.emit(createMatchMatchedEvent(
      savedConversation.id,
      freshQueue.userId,
      freshMatchedQueue.userId,
      freshQueue.id,
      freshMatchedQueue.id,
    ));

    this.logger.log(
      `Match created: ${freshQueue.userId} <-> ${freshMatchedQueue.userId}`,
    );

    return freshQueue;
  }

  // ── Scheduled job ──

  @Interval(3000)
  async retryMatching() {
    if (this.retryMatchingRunning) {
      return;
    }

    this.retryMatchingRunning = true;
    const now = new Date();

    try {
      const expiringQueues = await this.matchQueueRepository.findWaitingWithExpiry();
      const toExpire = expiringQueues.filter(
        (q) => q.expiresAt && q.expiresAt < now,
      );

      if (toExpire.length > 0) {
        await this.matchQueueRepository.expireAllExpired(now);

        this.logger.log(`Expired ${toExpire.length} stale match queues`);
        for (const eq of toExpire) {
          this.eventBus.emit(createMatchExpiredEvent(eq.userId, eq.id));
        }
      }

      const waitingQueues = await this.matchQueueRepository.findWaiting();
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

  // ── Private helpers ──

  private findMatchInBatch(
    userQueue: MatchQueue,
    waitingQueues: MatchQueue[],
    processedQueueIds: Set<string>,
    processedUserIds: Set<string>,
  ): MatchQueue | null {
    if (!userQueue.gender || !userQueue.city) {
      return null;
    }

    const preferredGenders = this.getPreferredGenders(userQueue.gender, userQueue.preferredGender);
    const now = Date.now();

    // Sort waiting queues by priority (VIP first), then by join time
    const sorted = [...waitingQueues]
      .filter(
        (queue) =>
          queue.id !== userQueue.id &&
          queue.userId !== userQueue.userId &&
          !processedQueueIds.has(queue.id) &&
          !processedUserIds.has(queue.userId) &&
          queue.status === MatchQueueStatus.Waiting &&
          queue.gender === userQueue.gender &&
          queue.city === userQueue.city &&
          (!queue.expiresAt || queue.expiresAt.getTime() > now),
      )
      .sort((a, b) => {
        // Higher priority first, then earlier join time
        if (b.priorityScore !== a.priorityScore) {
          return b.priorityScore - a.priorityScore;
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    for (const gender of preferredGenders) {
      const match = sorted.find((q) => q.gender === gender);
      if (match) return match;
    }

    return null;
  }

  private getPreferredGenders(gender: UserGender, preferredGender?: string | null): UserGender[] {
    // If user specified a preferred gender, use only that
    if (preferredGender && Object.values(UserGender).includes(preferredGender as UserGender)) {
      return [preferredGender as UserGender];
    }
    // Otherwise use default preference based on own gender
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
