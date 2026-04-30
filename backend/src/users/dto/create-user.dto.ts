import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  email!: string;
  password!: string;
  fullName?: string;
  role?: UserRole;
}
