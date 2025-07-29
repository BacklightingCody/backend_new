import { PartialType } from '@nestjs/mapped-types';
import { CreateBookStackDto } from './create-bookstack.dto';
import { IsOptional, IsString, IsBoolean, IsInt, IsArray, IsNumber, MinLength, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBookStackDto extends PartialType(CreateBookStackDto) {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  author?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  publisher?: string;

  @IsOptional()
  publishDate?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageCount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
