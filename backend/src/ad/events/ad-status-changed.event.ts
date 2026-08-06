import type { EventPayload } from '../../common/events/event-bus.service';

export const AD_STATUS_CHANGED = 'ad.status_changed';

export function createAdStatusChangedEvent(
  adId: string,
  userId: string,
  oldStatus: string,
  newStatus: string,
): EventPayload {
  return {
    eventName: AD_STATUS_CHANGED,
    aggregateId: adId,
    occurredAt: new Date(),
    data: { userId, oldStatus, newStatus },
  };
}
