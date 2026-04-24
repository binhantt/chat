export interface UserDTO {
  id: string;
  email?: string;
  displayName: string;
  trustScore: number;
  attributes?: Record<string, string | number | boolean | null>;
  personalDetail?: {
    gender?: string;
    birthDate?: string;
  };
}
