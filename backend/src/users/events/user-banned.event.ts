import type { EventPayload } from '../../common/events/event-bus.service';

export const USER_BANNED = 'user.banned';

export function createUserBannedEvent(
  userId: string,
  lockType: string,
  reason: string,
  source: 'report' | 'admin',
): EventPayload {
  return {
    eventName: USER_BANNED,
    aggregateId: userId,
    occurredAt: new Date(),
    data: { lockType, reason, source },
  };
}
