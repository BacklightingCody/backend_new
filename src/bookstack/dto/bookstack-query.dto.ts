import { IsOptional, IsBoolean, IsNumber, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SearchDto } from '../../common/dto/pagination.dto';

export class BookStackQueryDto extends SearchDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxRating?: number;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}
