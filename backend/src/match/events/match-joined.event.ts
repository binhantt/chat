import type { EventPayload } from '../../common/events/event-bus.service';

export const MATCH_JOINED = 'match.joined';

export function createMatchJoinedEvent(
  userId: string,
  queueId: string,
  gender: string | null,
  city: string | null,
): EventPayload {
  return {
    eventName: MATCH_JOINED,
    aggregateId: userId,
    occurredAt: new Date(),
    data: { queueId, gender, city },
  };
}
