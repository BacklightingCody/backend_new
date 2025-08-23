import { IsString, IsOptional, IsArray, IsBoolean, ValidateNested, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ImageUrlDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsEnum(['low', 'high', 'auto'])
  detail?: 'low' | 'high' | 'auto';
}

export class MessageContentDto {
  @IsEnum(['text', 'image_url'])
  type: 'text' | 'image_url';

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImageUrlDto)
  image_url?: ImageUrlDto;
}

export class OpenAIMessageDto {
  @IsEnum(['system', 'user', 'assistant'])
  role: 'system' | 'user' | 'assistant';

  @IsString()
  content: string;
}

export class PlaceholderItemDto {
  @IsString()
  id: string;

  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsEnum(['doc', 'img', 'product', 'language', 'version', 'gitCommitId', 'fileMd5', 'other'])
  type: 'doc' | 'img' | 'product' | 'language' | 'version' | 'gitCommitId' | 'fileMd5' | 'other';

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ModelConfigDto {
  @IsString()
  model: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTokens?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  topP?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  topK?: number;

  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  frequencyPenalty?: number;

  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  presencePenalty?: number;
}

export class SendMessageDto {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  texts?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ModelConfigDto)
  modelConfig?: ModelConfigDto;

  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaceholderItemDto)
  placeholders?: PlaceholderItemDto[];

  @IsOptional()
  @IsBoolean()
  suppressUserMessage?: boolean;
}
