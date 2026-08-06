import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MatchQueue, MatchQueueStatus } from '../entities/match-queue.entity';

@Injectable()
export class MatchQueueRepository {
  constructor(
    @InjectRepository(MatchQueue)
    private readonly repository: Repository<MatchQueue>,
  ) {}

  create(data: Partial<MatchQueue>): MatchQueue {
    return this.repository.create(data);
  }

  saveOne(queue: MatchQueue): Promise<MatchQueue> {
    return this.repository.save(queue);
  }

  findById(id: string): Promise<MatchQueue | null> {
    return this.repository.findOne({ where: { id } });
  }

  findLatestByUserId(userId: string): Promise<MatchQueue | null> {
    return this.repository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  findWaiting(): Promise<MatchQueue[]> {
    return this.repository.find({
      where: { status: MatchQueueStatus.Waiting },
      order: { priorityScore: 'DESC', createdAt: 'ASC' },
    });
  }

  // findWaitingWithExpiry is an alias of findWaiting — used for clarity in retryMatching
  findWaitingWithExpiry(): Promise<MatchQueue[]> {
    return this.findWaiting();
  }

  async cancelAllForUser(
    userId: string,
    excludeIds: string[] = [],
  ): Promise<void> {
    const query = this.repository
      .createQueryBuilder()
      .update(MatchQueue)
      .set({ status: MatchQueueStatus.Cancelled })
      .where('userId = :userId', { userId })
      .andWhere('status IN (:...statuses)', {
        statuses: [MatchQueueStatus.Waiting, MatchQueueStatus.Matched],
      });

    if (excludeIds.length > 0) {
      query.andWhere('id NOT IN (:...excludeIds)', { excludeIds });
    }

    await query.execute();
  }

  async expireAllExpired(now: Date): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(MatchQueue)
      .set({ status: MatchQueueStatus.Expired })
      .where('status = :status', { status: MatchQueueStatus.Waiting })
      .andWhere('expiresAt IS NOT NULL')
      .andWhere('expiresAt < :now', { now })
      .execute();
  }

  async cancelByConversationIds(conversationIds: string[]): Promise<void> {
    await this.repository.update(
      { conversationId: In(conversationIds) },
      { status: MatchQueueStatus.Cancelled },
    );
  }

  findMatchWithCriteria(
    userId: string,
    preferredGenders: string[],
    city: string,
    ageMin?: number | null,
    ageMax?: number | null,
  ): Promise<MatchQueue | null> {
    const query = this.repository
      .createQueryBuilder('mq')
      .where('mq.status = :status', { status: MatchQueueStatus.Waiting })
      .andWhere('mq.userId != :userId', { userId })
      .andWhere('mq.gender IN (:...preferredGenders)', { preferredGenders })
      .andWhere('mq.city = :city', { city })
      .andWhere('mq.expiresAt > :now', { now: new Date() });

    // Apply age filter when the target queue has age range set
    if (ageMin != null) {
      query.andWhere('(mq.ageMin IS NULL OR mq.ageMin <= :ageMax)', { ageMax: ageMin });
    }
    if (ageMax != null) {
      query.andWhere('(mq.ageMax IS NULL OR mq.ageMax >= :ageMin)', { ageMin: ageMax });
    }

    query
      .addSelect(
        'CASE mq.gender ' +
          preferredGenders
            .map((gender, index) => `WHEN '${gender}' THEN ${index}`)
            .join(' ') +
          ' ELSE 99 END',
        'gender_rank',
      )
      .orderBy('mq.priorityScore', 'DESC')
      .addOrderBy('gender_rank', 'ASC')
      .addOrderBy('mq.createdAt', 'ASC');

    return query.getOne();
  }

  update(
    criteria: Parameters<Repository<MatchQueue>['update']>[0],
    data: Partial<MatchQueue>,
  ): Promise<unknown> {
    return this.repository.update(criteria, data);
  }
}
