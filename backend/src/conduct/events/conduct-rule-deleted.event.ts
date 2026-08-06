import type { EventPayload } from './event-bus.service';

export const CONDUCT_RULE_DELETED = 'conduct.rule.deleted';

export function createConductRuleDeletedEvent(
  ruleId: string,
): EventPayload {
  return {
    eventName: CONDUCT_RULE_DELETED,
    aggregateId: ruleId,
    occurredAt: new Date(),
    data: {},
  };
}
