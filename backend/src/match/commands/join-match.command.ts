export interface JoinMatchCommand {
  userId: string;
  preferredGender?: string;
  city?: string;
  ageMin?: number;
  ageMax?: number;
}
