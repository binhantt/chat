import type { EventPayload } from '../../common/events/event-bus.service';

export const USER_CREATED = 'user.created';

export function createUserCreatedEvent(
  userId: string,
  email: string,
  method: 'google' | 'admin',
): EventPayload {
  return {
    eventName: USER_CREATED,
    aggregateId: userId,
    occurredAt: new Date(),
    data: { email, method },
  };
}
