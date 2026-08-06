import { ConductRule } from '../entities/conduct-rule.entity';

export interface GetConductRulesQuery {
  cursor?: string;
  limit?: number;
}

export interface ConductRulePage {
  items: ConductRule[];
  limit: number;
  nextCursor: string | null;
}
