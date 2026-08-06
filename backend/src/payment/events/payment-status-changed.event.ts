import type { EventPayload } from '../../common/events/event-bus.service';

export const PAYMENT_STATUS_CHANGED = 'payment.status_changed';

export function createPaymentStatusChangedEvent(
  paymentId: string,
  userId: string,
  oldStatus: string,
  newStatus: string,
): EventPayload {
  return {
    eventName: PAYMENT_STATUS_CHANGED,
    aggregateId: paymentId,
    occurredAt: new Date(),
    data: { userId, oldStatus, newStatus },
  };
}
