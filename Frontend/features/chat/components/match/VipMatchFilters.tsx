export type MatchFilters = {
  preferredGender?: string;
  city?: string;
  ageMin?: number;
  ageMax?: number;
};

type VipMatchFiltersProps = {
  filters: MatchFilters;
  onChange: (filters: MatchFilters) => void;
};

export function VipMatchFilters({ filters, onChange }: VipMatchFiltersProps) {
  return null;
}
