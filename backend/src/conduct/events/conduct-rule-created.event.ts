import type { EventPayload } from './event-bus.service';

export const CONDUCT_RULE_CREATED = 'conduct.rule.created';

export function createConductRuleCreatedEvent(
  ruleId: string,
  phrase: string,
): EventPayload {
  return {
    eventName: CONDUCT_RULE_CREATED,
    aggregateId: ruleId,
    occurredAt: new Date(),
    data: { phrase },
  };
}
