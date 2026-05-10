import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, Min, Max, IsDate } from 'class-validator';
import { UserGender } from '../entities/user.entity';

export class UpdateProfileDto {
  @ApiProperty({ required: false, enum: UserGender })
  @IsEnum(UserGender)
  @IsOptional()
  gender?: UserGender;

  @ApiProperty({ required: false, example: 'Hà Nội' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  banStatus?: string; // 'active' or 'banned'

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  violationCount?: number; // Daily violation count

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  lastViolationDate?: Date; // Date of last violation
}