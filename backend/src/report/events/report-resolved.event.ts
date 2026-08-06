import type { EventPayload } from '../../common/events/event-bus.service';

export const REPORT_RESOLVED = 'report.resolved';

export function createReportResolvedEvent(
  reportId: string,
  reportedUserId: string,
  adminId: string,
  lockType: string,
): EventPayload {
  return {
    eventName: REPORT_RESOLVED,
    aggregateId: reportId,
    occurredAt: new Date(),
    data: { reportedUserId, adminId, lockType },
  };
}
