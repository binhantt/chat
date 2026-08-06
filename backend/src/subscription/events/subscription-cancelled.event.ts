import type { EventPayload } from '../../common/events/event-bus.service';

export const SUBSCRIPTION_CANCELLED = 'subscription.cancelled';

export function createSubscriptionCancelledEvent(
  subscriptionId: string,
  userId: string,
  planId: string,
): EventPayload {
  return {
    eventName: SUBSCRIPTION_CANCELLED,
    aggregateId: subscriptionId,
    occurredAt: new Date(),
    data: { userId, planId },
  };
}
