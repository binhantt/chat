import type { EventPayload } from '../../common/events/event-bus.service';

export const REPORT_STATUS_CHANGED = 'report.status.changed';

export function createReportStatusChangedEvent(
  reportId: string,
  oldStatus: string,
  newStatus: string,
  adminId: string,
): EventPayload {
  return {
    eventName: REPORT_STATUS_CHANGED,
    aggregateId: reportId,
    occurredAt: new Date(),
    data: { oldStatus, newStatus, adminId },
  };
}
