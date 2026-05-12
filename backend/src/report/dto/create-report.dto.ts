import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
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
  description?: string;
}
