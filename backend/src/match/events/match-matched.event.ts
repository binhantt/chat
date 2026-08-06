import type { EventPayload } from '../../common/events/event-bus.service';

export const MATCH_MATCHED = 'match.matched';

export function createMatchMatchedEvent(
  conversationId: string,
  user1Id: string,
  user2Id: string,
  user1QueueId: string,
  user2QueueId: string,
): EventPayload {
  return {
    eventName: MATCH_MATCHED,
    aggregateId: conversationId,
    occurredAt: new Date(),
    data: { user1Id, user2Id, user1QueueId, user2QueueId },
  };
}
