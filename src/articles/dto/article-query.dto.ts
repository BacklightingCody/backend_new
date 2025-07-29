import { IsOptional, IsBoolean, IsInt, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SearchDto } from '../../common/dto/pagination.dto';

export class ArticleQueryDto extends SearchDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isDraft?: boolean;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}
