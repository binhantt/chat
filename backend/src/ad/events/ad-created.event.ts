import type { EventPayload } from '../../common/events/event-bus.service';

export const AD_CREATED = 'ad.created';

export function createAdCreatedEvent(
  adId: string,
  userId: string,
  title: string,
): EventPayload {
  return {
    eventName: AD_CREATED,
    aggregateId: adId,
    occurredAt: new Date(),
    data: { userId, title },
  };
}
