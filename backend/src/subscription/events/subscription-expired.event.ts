import type { EventPayload } from '../../common/events/event-bus.service';

export const SUBSCRIPTION_EXPIRED = 'subscription.expired';

export function createSubscriptionExpiredEvent(
  subscriptionId: string,
  userId: string,
  planId: string,
): EventPayload {
  return {
    eventName: SUBSCRIPTION_EXPIRED,
    aggregateId: subscriptionId,
    occurredAt: new Date(),
    data: { userId, planId },
  };
}
