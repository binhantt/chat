import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, Min } from 'class-validator';
import { PlanType } from '../entities/subscription-plan.entity';

export class CreatePlanDto {
  @IsString()
  type!: PlanType;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(1)
  durationDays!: number;

  @IsArray()
  features!: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  matchPrioritySeconds?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
