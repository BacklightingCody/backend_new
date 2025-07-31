import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ModelProvider } from '@prisma/client';

export class ModelConfigDto {
  @IsEnum(ModelProvider)
  modelProvider: ModelProvider;

  @IsString()
  modelName: string;

  @IsOptional()
  @IsString()
  modelUrl?: string;

  @IsOptional()
  @IsString()
  modelToken?: string;

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

export class CreateChatSessionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ValidateNested()
  @Type(() => ModelConfigDto)
  modelConfig: ModelConfigDto;

  @IsOptional()
  @IsBoolean()
  shareAble?: boolean;

  @IsOptional()
  @IsString()
  sessionType?: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsString()
  productCode?: string;
}
