import { IsString, IsOptional, IsBoolean, IsInt, IsArray, IsNumber, MinLength, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookStackDto {
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  slug: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  title: string;

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
  progress?: number = 0;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean = false;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number = 0;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  category: string;

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
  language?: string = 'zh-CN';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
