import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { ActivityStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(ActivityStatus)
  currentStatus: ActivityStatus;

  @IsOptional()
  @IsDateString()
  lastActivity?: string;

  @IsOptional()
  @IsString()
  currentApp?: string;

  @IsOptional()
  @IsString()
  currentWindow?: string;
}
