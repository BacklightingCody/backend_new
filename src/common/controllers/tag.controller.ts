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
  UseGuards,
} from '@nestjs/common';
import { TagService } from '../services/tag.service';
import { AuthGuard, Roles, Public } from '../../auth/auth.guard';
import { ApiResponse, PaginationResult } from '../../types';
import { Tag, BookTag } from '@prisma/client';

interface CreateTagDto {
  name: string;
  slug?: string;
  color?: string;
  description?: string;
}

interface UpdateTagDto {
  name?: string;
  slug?: string;
  color?: string;
  description?: string;
}

interface TagQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  // 文章标签接口
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  @Post('articles')
  async createArticleTag(@Body() createTagDto: CreateTagDto): Promise<ApiResponse<Tag>> {
    try {
      const tag = await this.tagService.createArticleTag(createTagDto);
      return {
        success: true,
        data: tag,
        message: 'Article tag created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Public()
  @Get('articles')
  async findAllArticleTags(@Query() query: TagQueryDto): Promise<ApiResponse<PaginationResult<Tag>>> {
    try {
      const result = await this.tagService.findAllArticleTags(query);
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

  @Public()
  @Get('articles/:id')
  async findArticleTag(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<Tag>> {
    try {
      const tag = await this.tagService.findArticleTagById(id);
      return {
        success: true,
        data: tag,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  @Patch('articles/:id')
  async updateArticleTag(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: UpdateTagDto,
  ): Promise<ApiResponse<Tag>> {
    try {
      const tag = await this.tagService.updateArticleTag(id, updateTagDto);
      return {
        success: true,
        data: tag,
        message: 'Article tag updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  @Delete('articles/:id')
  async deleteArticleTag(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<Tag>> {
    try {
      const tag = await this.tagService.deleteArticleTag(id);
      return {
        success: true,
        data: tag,
        message: 'Article tag deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 书籍标签接口
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  @Post('books')
  async createBookTag(@Body() createTagDto: Omit<CreateTagDto, 'slug' | 'description'>): Promise<ApiResponse<BookTag>> {
    try {
      const tag = await this.tagService.createBookTag(createTagDto);
      return {
        success: true,
        data: tag,
        message: 'Book tag created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Public()
  @Get('books')
  async findAllBookTags(@Query() query: TagQueryDto): Promise<ApiResponse<PaginationResult<BookTag>>> {
    try {
      const result = await this.tagService.findAllBookTags(query);
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

  @Public()
  @Get('books/:id')
  async findBookTag(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<BookTag>> {
    try {
      const tag = await this.tagService.findBookTagById(id);
      return {
        success: true,
        data: tag,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  @Patch('books/:id')
  async updateBookTag(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: Omit<UpdateTagDto, 'slug' | 'description'>,
  ): Promise<ApiResponse<BookTag>> {
    try {
      const tag = await this.tagService.updateBookTag(id, updateTagDto);
      return {
        success: true,
        data: tag,
        message: 'Book tag updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  @Delete('books/:id')
  async deleteBookTag(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<BookTag>> {
    try {
      const tag = await this.tagService.deleteBookTag(id);
      return {
        success: true,
        data: tag,
        message: 'Book tag deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
