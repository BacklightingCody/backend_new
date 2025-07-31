import { IsString, IsOptional, IsArray, IsEnum, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ChatMessageRole } from '@prisma/client';

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
  @IsEnum(ChatMessageRole)
  role: ChatMessageRole;

  @IsString()
  content: string;
}

export class SendMessageDto {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsString()
  model: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpenAIMessageDto)
  messages: OpenAIMessageDto[];

  @IsOptional()
  @IsBoolean()
  stream?: boolean;

  @IsOptional()
  temperature?: number;

  @IsOptional()
  max_tokens?: number;

  @IsOptional()
  top_p?: number;

  @IsOptional()
  frequency_penalty?: number;

  @IsOptional()
  presence_penalty?: number;

  @IsOptional()
  top_k?: number;
}
