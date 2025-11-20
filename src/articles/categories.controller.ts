import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiResponse } from '../types';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<ApiResponse<any>> {
    try {
      const category = await this.categoriesService.create(createCategoryDto);
      return {
        success: true,
        data: category,
        message: 'Category created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get()
  async findAll(): Promise<ApiResponse<any[]>> {
    try {
      const categories = await this.categoriesService.findAll();
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

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string): Promise<ApiResponse<any>> {
    try {
      const category = await this.categoriesService.findBySlug(slug);
      return {
        success: true,
        data: category,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get(':slug/articles')
  async getArticlesByCategory(
    @Param('slug') slug: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ApiResponse<any>> {
    try {
      const result = await this.categoriesService.getArticlesByCategory(slug, {
        page: page || 1,
        limit: limit || 10,
      });
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

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ApiResponse<any>> {
    try {
      const category = await this.categoriesService.update(id, updateCategoryDto);
      return {
        success: true,
        data: category,
        message: 'Category updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<any>> {
    try {
      const category = await this.categoriesService.remove(id);
      return {
        success: true,
        data: category,
        message: 'Category deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}