import { UserRole } from '../entities/user.entity';

export class UpdateUserAccessDto {
  role!: UserRole;

  isActive!: boolean;
}
