export interface ConductRuleCreateInput {
  note?: string;
  phrase: string;
}

export interface ConductRuleUpdateInput {
  isActive?: boolean;
  note?: string | null;
  phrase?: string;
}

export interface ConductRuleQueryInput {
  cursor?: string;
  limit?: number;
}
