import { ConductRule } from '../entities/conduct-rule.entity';

export interface CheckMessageQuery {
  content: string;
}

export interface CheckMessageResult {
  violated: boolean;
  rule?: ConductRule;
}
