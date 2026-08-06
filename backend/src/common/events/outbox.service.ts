import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { EventPayload } from './event-bus.service';
import { OutboxEvent } from './outbox-event.entity';

@Injectable()
export class OutboxService {
  constructor(
    @InjectRepository(OutboxEvent)
    private readonly outboxRepository: Repository<OutboxEvent>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Save an event to the outbox table.
   * This runs outside the business transaction (separate INSERT).
   * For true transactional outbox, the handler must use queryRunner.
   */
  async save(
    event: EventPayload,
    aggregateType: string,
  ): Promise<OutboxEvent> {
    const outboxEvent = this.outboxRepository.create({
      eventName: event.eventName,
      aggregateId: event.aggregateId,
      aggregateType,
      occurredAt: event.occurredAt,
      payload: event.data,
      status: 'PENDING',
      retryCount: 0,
    });

    return this.outboxRepository.save(outboxEvent);
  }

  /**
   * Mark an outbox event as published.
   */
  async markPublished(id: string): Promise<void> {
    await this.outboxRepository.update(id, {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    });
  }

  /**
   * Mark an outbox event as failed with error message.
   */
  async markFailed(id: string, errorMessage: string): Promise<void> {
    await this.outboxRepository.update(id, {
      status: 'FAILED',
      errorMessage,
    });
  }

  /**
   * Find pending events that need to be published.
   * Uses SKIP LOCKED to avoid duplicate processing by multiple instances.
   */
  async findPending(limit = 20): Promise<OutboxEvent[]> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const events = await queryRunner.manager
        .createQueryBuilder(OutboxEvent, 'outbox')
        .where('outbox.status = :status', { status: 'PENDING' })
        .andWhere('outbox.retry_count < 10')
        .orderBy('outbox.createdAt', 'ASC')
        .limit(limit)
        .setLock('pessimistic_write')
        .getMany();

      await queryRunner.commitTransaction();
      return events;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Increment retry count for an event.
   */
  async findById(id: string): Promise<OutboxEvent | null> {
    return this.outboxRepository.findOne({ where: { id } });
  }

  async incrementRetry(id: string): Promise<void> {
    await this.outboxRepository.increment({ id }, 'retryCount', 1);
  }

  /**
   * Get outbox stats for monitoring.
   */
  async getStats() {
    const [pending, published, failed] = await Promise.all([
      this.outboxRepository.count({ where: { status: 'PENDING' } }),
      this.outboxRepository.count({ where: { status: 'PUBLISHED' } }),
      this.outboxRepository.count({ where: { status: 'FAILED' } }),
    ]);

    return { pending, published, failed, total: pending + published + failed };
  }
}
