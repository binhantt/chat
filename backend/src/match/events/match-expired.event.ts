import type { EventPayload } from '../../common/events/event-bus.service';

export const MATCH_EXPIRED = 'match.expired';

export function createMatchExpiredEvent(
  userId: string,
  queueId: string,
): EventPayload {
  return {
    eventName: MATCH_EXPIRED,
    aggregateId: userId,
    occurredAt: new Date(),
    data: { queueId },
  };
}
