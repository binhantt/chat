import type { EventPayload } from '../../common/events/event-bus.service';

export const USER_UNLOCKED = 'user.unlocked';

export function createUserUnlockedEvent(
  userId: string,
  source: 'report' | 'admin',
): EventPayload {
  return {
    eventName: USER_UNLOCKED,
    aggregateId: userId,
    occurredAt: new Date(),
    data: { source },
  };
}
