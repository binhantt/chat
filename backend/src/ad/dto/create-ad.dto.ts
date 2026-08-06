import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateAdDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  targetUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;
}

export class UpdateAdStatusDto {
  @IsString()
  status!: 'active' | 'rejected';
}
