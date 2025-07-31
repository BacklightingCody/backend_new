import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsObject, Min } from 'class-validator';
import { ActivityType } from '@prisma/client';

export class CreateActivityDto {
  @IsEnum(ActivityType)
  activityType: ActivityType;

  @IsOptional()
  @IsString()
  applicationName?: string;

  @IsOptional()
  @IsString()
  windowTitle?: string;

  @IsOptional()
  @IsString()
  processName?: string;

  @IsOptional()
  @IsString()
  operatingSystem?: string;

  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsDateString()
  startTime: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
