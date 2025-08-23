import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsEnum(['system', 'user', 'assistant'])
  role!: 'system' | 'user' | 'assistant';

  @IsString()
  content!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  texts?: string[];

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  rawContent?: string;
}


