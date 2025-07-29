import { IsString, IsOptional, IsBoolean, IsInt, IsArray, MinLength, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateArticleDto {
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
  summary?: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readTime?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  category: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isDraft?: boolean = true;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Type(() => Number)
  @IsInt()
  userId: number;
}
