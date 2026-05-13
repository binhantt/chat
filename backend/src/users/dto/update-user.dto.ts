import { UserGender } from '../entities/user.entity';

export class UpdateUserDto {
  fullName?: string | null;

  avatarUrl?: string | null;

  dateOfBirth?: string | null;

  phoneNumber?: string | null;

  bio?: string | null;

  gender?: UserGender | null;

  city?: string | null;
}
