import {
  IsOptional,
  IsString,
  IsDateString,
  IsPhoneNumber,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { UserGender } from '../entities/user.entity';

export class ProfileSetupDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('VN')
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;

  @IsOptional()
  @IsString()
  city?: string;
}
