import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class UpdateAiSettingsDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  groqApiKey?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groqApiKeys?: string[];

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  replyFrequency?: number;

  @IsOptional()
  @IsString()
  botName?: string;

  @IsOptional()
  @IsString()
  personality?: string;

  @IsOptional()
  @IsString()
  botGender?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  timeoutMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  aiTakeoverMessages?: number;
}
