import type { EventPayload } from '../../common/events/event-bus.service';

export const PAYMENT_CREATED = 'payment.created';

export function createPaymentCreatedEvent(
  paymentId: string,
  userId: string,
  amount: number,
  method: string,
): EventPayload {
  return {
    eventName: PAYMENT_CREATED,
    aggregateId: paymentId,
    occurredAt: new Date(),
    data: { userId, amount, method },
  };
}
