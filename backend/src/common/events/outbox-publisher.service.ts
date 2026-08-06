import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventBusService, type EventPayload } from './event-bus.service';
import { OutboxService } from './outbox.service';

@Injectable()
export class OutboxPublisher {
  private readonly logger = new Logger(OutboxPublisher.name);

  constructor(
    private readonly outboxService: OutboxService,
    private readonly eventBus: EventBusService,
  ) {}

  /**
   * Poll every 5 seconds for pending outbox events and publish them.
   */
  @Cron(CronExpression.EVERY_5_SECONDS)
  async processOutbox(): Promise<void> {
    const events = await this.outboxService.findPending(20);

    if (events.length === 0) {
      return;
    }

    this.logger.log(`Processing ${events.length} pending outbox events`);

    for (const outboxEvent of events) {
      try {
        const payload: EventPayload = {
          eventName: outboxEvent.eventName,
          aggregateId: outboxEvent.aggregateId,
          occurredAt: outboxEvent.occurredAt,
          data: outboxEvent.payload,
        };

        this.eventBus.emit(payload);
        await this.outboxService.markPublished(outboxEvent.id);

        this.logger.debug(
          `Published outbox event ${outboxEvent.eventName} (${outboxEvent.aggregateId})`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to publish outbox event ${outboxEvent.id}: ${error instanceof Error ? error.message : error}`,
        );
        await this.outboxService.incrementRetry(outboxEvent.id);

        if (outboxEvent.retryCount >= 9) {
          await this.outboxService.markFailed(
            outboxEvent.id,
            error instanceof Error ? error.message : 'Unknown error',
          );
        }
      }
    }
  }

  /**
   * Force-publish a single event immediately (bypass cron).
   */
  async publishOne(id: string): Promise<void> {
    const outboxEvent = await this.outboxService.findById(id);

    if (!outboxEvent) {
      throw new Error(`Outbox event ${id} not found`);
    }

    const payload: EventPayload = {
      eventName: outboxEvent.eventName,
      aggregateId: outboxEvent.aggregateId,
      occurredAt: outboxEvent.occurredAt,
      data: outboxEvent.payload,
    };

    this.eventBus.emit(payload);
    await this.outboxService.markPublished(outboxEvent.id);
  }
}
