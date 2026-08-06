import type { EventPayload } from '../../common/events/event-bus.service';

export const REPORT_CREATED = 'report.created';

export function createReportCreatedEvent(
  reportId: string,
  reporterId: string,
  reportedUserId: string,
  reason: string,
): EventPayload {
  return {
    eventName: REPORT_CREATED,
    aggregateId: reportId,
    occurredAt: new Date(),
    data: { reporterId, reportedUserId, reason },
  };
}
