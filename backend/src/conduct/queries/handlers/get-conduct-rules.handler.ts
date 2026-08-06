import { Injectable } from '@nestjs/common';
import type { GetConductRulesQuery, ConductRulePage } from '../get-conduct-rules.query';
import { ConductRuleRepository } from '../../repositories/conduct-rule.repository';
import { ConductRuleCursorService } from '../../services/conduct-rule-cursor.service';

@Injectable()
export class GetConductRulesHandler {
  constructor(
    private readonly conductRuleRepository: ConductRuleRepository,
    private readonly cursor: ConductRuleCursorService,
  ) {}

  async execute(query: GetConductRulesQuery): Promise<ConductRulePage> {
    const safeLimit = Math.min(Math.max(query.limit || 20, 1), 100);
    const rows = await this.conductRuleRepository.findPage({
      cursor: this.cursor.decode(query.cursor),
      limit: safeLimit,
    });
    const items = rows.slice(0, safeLimit);
    const nextCursor =
      rows.length > safeLimit
        ? this.cursor.encode(items[items.length - 1])
        : null;

    return {
      items,
      limit: safeLimit,
      nextCursor,
    };
  }
}
