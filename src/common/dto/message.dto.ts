import { IsString, IsInt, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  content: string;

  @Type(() => Number)
  @IsInt()
  articleId: number;

  @Type(() => Number)
  @IsInt()
  userId: number;
}

export class UpdateMessageDto {
  @IsString()
  @MinLength(1)
  content: string;
}
