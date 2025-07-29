import { IsOptional, IsEnum, IsString } from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';
import { SearchDto } from '../../common/dto/pagination.dto';

export class UserQueryDto extends SearchDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  email?: string;
}
