import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, Min } from 'class-validator';
import { PlanType } from '../entities/subscription-plan.entity';

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  type?: PlanType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  matchPrioritySeconds?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
