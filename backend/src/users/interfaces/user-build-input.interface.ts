import { UserRole } from '../entities/user.entity';

export interface UserBuildInput {
  id?: string;
  email: string;
  password?: string;
  googleId?: string;
  fullName?: string;
  avatarUrl?: string;
  role?: UserRole;
}
