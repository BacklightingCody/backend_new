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
} from '@nestjs/common';
import { BookstackService } from './bookstack.service';
import { CreateBookStackDto } from './dto/create-bookstack.dto';
import { UpdateBookStackDto } from './dto/update-bookstack.dto';
import { BookStackQueryDto } from './dto/bookstack-query.dto';
import { ApiResponse, PaginationResult } from '../types';
import { BookStack } from '@prisma/client';

@Controller('bookstack')
export class BookstackController {
  constructor(private readonly bookstackService: BookstackService) {}

  @Post()
  async create(@Body() createBookStackDto: CreateBookStackDto): Promise<ApiResponse<BookStack>> {
    try {
      const book = await this.bookstackService.create(createBookStackDto);
      return {
        success: true,
        data: book,
        message: 'Book created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get()
  async findAll(@Query() query: BookStackQueryDto): Promise<ApiResponse<PaginationResult<BookStack>>> {
    try {
      const result = await this.bookstackService.findAll(query);
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

  @Get('categories')
  async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      const categories = await this.bookstackService.getCategories();
      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('languages')
  async getLanguages(): Promise<ApiResponse<string[]>> {
    try {
      const languages = await this.bookstackService.getLanguages();
      return {
        success: true,
        data: languages,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('completed')
  async getCompleted(@Query('limit') limit?: number): Promise<ApiResponse<BookStack[]>> {
    try {
      const books = await this.bookstackService.getCompletedBooks(limit);
      return {
        success: true,
        data: books,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('currently-reading')
  async getCurrentlyReading(@Query('limit') limit?: number): Promise<ApiResponse<BookStack[]>> {
    try {
      const books = await this.bookstackService.getCurrentlyReading(limit);
      return {
        success: true,
        data: books,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('top-rated')
  async getTopRated(@Query('limit') limit?: number): Promise<ApiResponse<BookStack[]>> {
    try {
      const books = await this.bookstackService.getTopRatedBooks(limit);
      return {
        success: true,
        data: books,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('stats')
  async getStats(): Promise<ApiResponse<any>> {
    try {
      const stats = await this.bookstackService.getReadingStats();
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

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<BookStack>> {
    try {
      const book = await this.bookstackService.findOne(id);
      return {
        success: true,
        data: book,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<ApiResponse<BookStack>> {
    try {
      const book = await this.bookstackService.findBySlug(slug);
      return {
        success: true,
        data: book,
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
    @Body() updateBookStackDto: UpdateBookStackDto,
  ): Promise<ApiResponse<BookStack>> {
    try {
      const book = await this.bookstackService.update(id, updateBookStackDto);
      return {
        success: true,
        data: book,
        message: 'Book updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Patch(':id/progress')
  async updateProgress(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { progress: number },
  ): Promise<ApiResponse<BookStack>> {
    try {
      const book = await this.bookstackService.updateProgress(id, body.progress);
      return {
        success: true,
        data: book,
        message: 'Reading progress updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Patch(':id/rating')
  async updateRating(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { rating: number },
  ): Promise<ApiResponse<BookStack>> {
    try {
      const book = await this.bookstackService.updateRating(id, body.rating);
      return {
        success: true,
        data: book,
        message: 'Book rating updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<BookStack>> {
    try {
      const book = await this.bookstackService.remove(id);
      return {
        success: true,
        data: book,
        message: 'Book deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
