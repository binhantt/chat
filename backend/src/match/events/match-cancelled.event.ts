import type { EventPayload } from '../../common/events/event-bus.service';

export const MATCH_CANCELLED = 'match.cancelled';

export function createMatchCancelledEvent(
  userId: string,
  reason: string,
): EventPayload {
  return {
    eventName: MATCH_CANCELLED,
    aggregateId: userId,
    occurredAt: new Date(),
    data: { reason },
  };
}
