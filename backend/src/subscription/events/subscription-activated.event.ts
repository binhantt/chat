import type { EventPayload } from '../../common/events/event-bus.service';

export const SUBSCRIPTION_ACTIVATED = 'subscription.activated';

export function createSubscriptionActivatedEvent(
  subscriptionId: string,
  userId: string,
  planId: string,
  planName: string,
  endDate: Date,
): EventPayload {
  return {
    eventName: SUBSCRIPTION_ACTIVATED,
    aggregateId: subscriptionId,
    occurredAt: new Date(),
    data: { userId, planId, planName, endDate },
  };
}
