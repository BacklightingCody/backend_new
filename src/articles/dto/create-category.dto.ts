import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}