import { IsOptional, IsString, MaxLength } from 'class-validator';

export class TrackPageVisitDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  path?: string;

  @IsString()
  @MaxLength(80)
  visitorId!: string;
}
