import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportUserDto {
  @IsNumber()
  id: number;

  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class ImportTagDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ImportArticleTagDto {
  @IsNumber()
  tagId: number;
}

export class ImportArticleDto {
  @IsNumber()
  id: number;

  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsNumber()
  readTime?: number;

  @IsString()
  category: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @IsOptional()
  @IsNumber()
  viewCount?: number;

  @IsOptional()
  @IsNumber()
  likes?: number;

  @IsOptional()
  @IsNumber()
  bookmarks?: number;

  @IsOptional()
  @IsNumber()
  comments?: number;

  @IsNumber()
  userId: number;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportArticleTagDto)
  articleTags: ImportArticleTagDto[];
}

export class ImportDataDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportUserDto)
  users: ImportUserDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportTagDto)
  tags: ImportTagDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportArticleDto)
  articles: ImportArticleDto[];
}
