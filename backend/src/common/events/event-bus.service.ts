import { Injectable, Logger } from '@nestjs/common';
import { Subject, filter, type Observable } from 'rxjs';
import { CircuitBreaker } from './circuit-breaker';
import { OutboxService } from './outbox.service';

export interface EventPayload {
  eventName: string;
  aggregateId: string;
  occurredAt: Date;
  data: Record<string, unknown>;
}

@Injectable()
export class EventBusService {
  private readonly eventSubject = new Subject<EventPayload>();
  private readonly logger = new Logger(EventBusService.name);
  private readonly circuitBreaker = new CircuitBreaker({
    threshold: 10,
    resetTimeoutMs: 30_000,
    name: 'EventBus::emit',
  });

  constructor(private readonly outboxService?: OutboxService) {}

  /**
   * Emit an event to in-memory subscribers.
   * Wrapped with CircuitBreaker to protect against failing subscribers.
   */
  emit(event: EventPayload): void {
    const { allowed } = this.circuitBreaker.protect(() => {
      this.eventSubject.next(event);
    });

    if (!allowed) {
      this.logger.warn(
        `Skipped event ${event.eventName} (${event.aggregateId}) — circuit OPEN`,
      );
    }
  }

  /**
   * Emit an event AND persist it to the outbox table.
   * The outbox event will be picked up by OutboxPublisher as a safety net.
   * Use this for critical events that must survive crashes.
   */
  async emitWithOutbox(
    event: EventPayload,
    aggregateType: string,
  ): Promise<void> {
    // Save to outbox first
    if (this.outboxService) {
      await this.outboxService.save(event, aggregateType);
    }

    // Then emit to in-memory subscribers
    this.emit(event);
  }

  on(eventName: string): Observable<EventPayload> {
    return this.eventSubject.pipe(
      filter((event) => event.eventName === eventName),
    );
  }

  getAll(): Observable<EventPayload> {
    return this.eventSubject.asObservable();
  }

  /** Expose circuit breaker state for monitoring */
  getCircuitState() {
    return {
      state: this.circuitBreaker.getState(),
      failureCount: this.circuitBreaker.getFailureCount(),
    };
  }

  /** Manually reset circuit breaker */
  resetCircuit(): void {
    this.circuitBreaker.reset();
  }
}
