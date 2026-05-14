import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ReportReason } from '../entities/report.entity';

export class CreateReportDto {
  @IsNotEmpty()
  @IsUUID()
  reportedUserId!: string;

  @IsNotEmpty()
  @IsEnum(ReportReason)
  reason!: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
