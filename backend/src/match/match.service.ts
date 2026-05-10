import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchQueue, MatchQueueStatus } from './entities/match-queue.entity';
import { User, UserGender } from '../users/entities/user.entity';
import { Conversation, ConversationStatus } from '../chat/entities/conversation.entity';

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);
  private readonly QUEUE_EXPIRY_MINUTES = 5;

  constructor(
    @InjectRepository(MatchQueue)
    private readonly matchQueueRepository: Repository<MatchQueue>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
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

    const existingQueue = await this.matchQueueRepository.findOne({
      where: { userId, status: MatchQueueStatus.Waiting },
    });

    if (existingQueue) {
      return existingQueue;
    }

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
      return this.createMatch(queue, match);
    }

    return queue;
  }

  async leaveQueue(userId: string): Promise<void> {
    const queue = await this.matchQueueRepository.findOne({
      where: { userId, status: MatchQueueStatus.Waiting },
    });

    if (queue) {
      queue.status = MatchQueueStatus.Cancelled;
      await this.matchQueueRepository.save(queue);
      this.logger.log(`User ${userId} left match queue`);
    }
  }

  async getQueueStatus(userId: string): Promise<MatchQueue | null> {
    return this.matchQueueRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getQueueStatusResponse(userId: string) {
    const status = await this.matchQueueRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!status) {
      return { inQueue: false };
    }

    const result: any = {
      inQueue: status.status === MatchQueueStatus.Waiting,
      status: status.status,
      conversationId: status.conversationId,
      matchedWithUserId: status.matchedWithUserId,
      joinedAt: status.createdAt,
    };

    if (status.status === MatchQueueStatus.Matched && status.matchedWithUserId) {
      const matchedUser = await this.userRepository.findOne({
        where: { id: status.matchedWithUserId },
      });
      if (matchedUser) {
        result.matchedUser = {
          id: matchedUser.id,
          email: matchedUser.email,
          fullName: matchedUser.fullName,
          avatarUrl: matchedUser.avatarUrl,
          gender: matchedUser.gender,
          city: matchedUser.city,
        };
      }
    }

    return result;
  }

  // Retry matching for all waiting users every 3 seconds
  @Interval(3000)
  async retryMatching() {
    const waitingQueues = await this.matchQueueRepository.find({
      where: { status: MatchQueueStatus.Waiting },
      order: { createdAt: 'ASC' },
    });

    for (const queue of waitingQueues) {
      // Skip expired queues
      if (queue.expiresAt && queue.expiresAt < new Date()) {
        queue.status = MatchQueueStatus.Expired;
        await this.matchQueueRepository.save(queue);
        this.logger.log(`Queue ${queue.id} expired`);
        continue;
      }

      const match = await this.findMatch(queue);
      if (match) {
        await this.createMatch(queue, match);
        this.logger.log(`Background match: ${queue.userId} <-> ${match.userId}`);
      }
    }
  }

  private async findMatch(userQueue: MatchQueue): Promise<MatchQueue | null> {
    if (!userQueue.gender) {
      return null;
    }

    const oppositeGender = this.getOppositeGender(userQueue.gender);
    if (!oppositeGender) {
      return null;
    }

    const match = await this.matchQueueRepository
      .createQueryBuilder('mq')
      .where('mq.status = :status', { status: MatchQueueStatus.Waiting })
      .andWhere('mq.userId != :userId', { userId: userQueue.userId })
      .andWhere('mq.gender = :gender', { gender: oppositeGender })
      .andWhere('mq.city = :city', { city: userQueue.city })
      .andWhere('mq.expiresAt > :now', { now: new Date() })
      .orderBy('mq.createdAt', 'ASC')
      .getOne();

    return match;
  }

  private async createMatch(
    queue: MatchQueue,
    matchedQueue: MatchQueue,
  ): Promise<MatchQueue> {
    const conversation = this.conversationRepository.create({
      user1Id: queue.userId,
      user2Id: matchedQueue.userId,
      status: ConversationStatus.Active,
    });

    const savedConversation = await this.conversationRepository.save(conversation);

    queue.status = MatchQueueStatus.Matched;
    queue.matchedWithUserId = matchedQueue.userId;
    queue.conversationId = savedConversation.id;
    await this.matchQueueRepository.save(queue);

    matchedQueue.status = MatchQueueStatus.Matched;
    matchedQueue.matchedWithUserId = queue.userId;
    matchedQueue.conversationId = savedConversation.id;
    await this.matchQueueRepository.save(matchedQueue);

    this.logger.log(`Match created: ${queue.userId} <-> ${matchedQueue.userId}`);

    return queue;
  }

  private getOppositeGender(gender: UserGender): UserGender | null {
    switch (gender) {
      case UserGender.Male:
        return UserGender.Female;
      case UserGender.Female:
        return UserGender.Male;
      default:
        return null;
    }
  }
}
