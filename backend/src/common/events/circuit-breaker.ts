import { Logger } from '@nestjs/common';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  /** Number of consecutive failures before opening the circuit */
  threshold: number;
  /** Milliseconds to wait before transitioning to HALF_OPEN */
  resetTimeoutMs: number;
  /** Name for logging */
  name: string;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly logger: Logger;

  constructor(private readonly options: CircuitBreakerOptions) {
    this.logger = new Logger(`CircuitBreaker:${options.name}`);
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  /**
   * Execute a synchronous function with circuit breaker protection.
   * - CLOSED: Execute normally
   * - OPEN: Skip immediately if still within reset timeout
   * - HALF_OPEN: Allow a single trial to test recovery
   *
   * Returns `{ allowed: true, result }` on success, `{ allowed: false }` if circuit is open.
   */
  protect<T>(fn: () => T): { allowed: boolean; result?: T } {
    if (this.state === 'OPEN') {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.options.resetTimeoutMs) {
        this.transitionTo('HALF_OPEN');
        this.logger.log(`Circuit HALF_OPEN, allowing trial`);
      } else {
        this.logger.warn(
          `Circuit OPEN, rejecting. ${Math.ceil((this.options.resetTimeoutMs - elapsed) / 1000)}s remaining`,
        );
        return { allowed: false };
      }
    }

    try {
      const result = fn();
      this.onSuccess();
      return { allowed: true, result };
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.logger.log('Trial succeeded, circuit CLOSED');
    }
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(error: unknown): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.transitionTo('OPEN');
      this.logger.warn('Trial failed, circuit OPEN again');
      return;
    }

    if (this.failureCount >= this.options.threshold) {
      this.transitionTo('OPEN');
    }
  }

  reset(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.logger.log('Circuit manually reset to CLOSED');
  }

  private transitionTo(newState: CircuitState): void {
    const prevState = this.state;
    this.state = newState;
    this.logger.log(`State: ${prevState} -> ${newState}`);
  }
}
