import type { EventPayload } from './event-bus.service';

export const CONDUCT_RULE_UPDATED = 'conduct.rule.updated';

export function createConductRuleUpdatedEvent(
  ruleId: string,
  changes: Record<string, unknown>,
): EventPayload {
  return {
    eventName: CONDUCT_RULE_UPDATED,
    aggregateId: ruleId,
    occurredAt: new Date(),
    data: changes,
  };
}
