export interface JoinMatchInput {
  userId: string;
  preferredGender?: string;
  city?: string;
  ageMin?: number;
  ageMax?: number;
}

export interface LeaveMatchInput {
  userId: string;
}

export interface GetMatchStatusInput {
  userId: string;
}
