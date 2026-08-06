export interface UpdateConductRuleCommand {
  id: string;
  phrase?: string;
  note?: string | null;
  isActive?: boolean;
}
