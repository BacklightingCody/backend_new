import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ApiResponse, PaginationResult } from '../types';
import { User } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.create(createUserDto);
      return {
        success: true,
        data: user,
        message: 'User created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get()
  async findAll(@Query() query: UserQueryDto): Promise<ApiResponse<PaginationResult<User>>> {
    try {
      const result = await this.userService.findAll(query);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.findOne(id);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get(':id/stats')
  async getUserStats(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<any>> {
    try {
      const stats = await this.userService.getUserStats(id);
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<ApiResponse<User | null>> {
    try {
      const user = await this.userService.findByEmail(email);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('clerk/:clerkId')
  async findByClerkId(@Param('clerkId') clerkId: string): Promise<ApiResponse<User | null>> {
    try {
      const user = await this.userService.findByClerkId(clerkId);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.update(id, updateUserDto);
      return {
        success: true,
        data: user,
        message: 'User updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: 'ACTIVE' | 'BANNED' | 'PENDING' },
  ): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.updateUserStatus(id, body.status);
      return {
        success: true,
        data: user,
        message: 'User status updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.remove(id);
      return {
        success: true,
        data: user,
        message: 'User deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('sync-clerk')
  async syncWithClerk(@Body() clerkUser: any): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.syncWithClerk(clerkUser);
      return {
        success: true,
        data: user,
        message: 'User synced with Clerk successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
