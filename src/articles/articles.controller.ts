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
import { ArticlesService } from './articles.service';
import { ArticleImportService } from './article-import.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ImportDataDto } from './dto/import-article.dto';
import { ArticleQueryDto } from './dto/article-query.dto';
import { ApiResponse, PaginationResult } from '../types';
import { Article } from '@prisma/client';

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly articleImportService: ArticleImportService,
  ) {}

  @Post()
  async create(@Body() createArticleDto: CreateArticleDto): Promise<ApiResponse<Article>> {
    try {
      const article = await this.articlesService.create(createArticleDto);
      return {
        success: true,
        data: article,
        message: 'Article created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get()
  async findAll(@Query() query: ArticleQueryDto): Promise<ApiResponse<PaginationResult<Article>>> {
    try {
      console.log('文章查询参数:', query);
      const result = await this.articlesService.findAll(query);
      console.log(`查询到 ${result.data.length} 篇文章`);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('文章查询失败:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('categories')
  async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      const categories = await this.articlesService.getCategories();
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

  @Get('popular')
  async getPopular(@Query('limit') limit?: number): Promise<ApiResponse<Article[]>> {
    try {
      const articles = await this.articlesService.getPopularArticles(limit);
      return {
        success: true,
        data: articles,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('recent')
  async getRecent(@Query('limit') limit?: number): Promise<ApiResponse<Article[]>> {
    try {
      const articles = await this.articlesService.getRecentArticles(limit);
      return {
        success: true,
        data: articles,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<Article>> {
    try {
      const article = await this.articlesService.findOne(id);
      return {
        success: true,
        data: article,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<ApiResponse<Article>> {
    try {
      const article = await this.articlesService.findBySlug(slug);
      return {
        success: true,
        data: article,
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
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<ApiResponse<Article>> {
    try {
      const article = await this.articlesService.update(id, updateArticleDto);
      return {
        success: true,
        data: article,
        message: 'Article updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Patch(':id/publish')
  async publish(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<Article>> {
    try {
      const article = await this.articlesService.publish(id);
      return {
        success: true,
        data: article,
        message: 'Article published successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Patch(':id/unpublish')
  async unpublish(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<Article>> {
    try {
      const article = await this.articlesService.unpublish(id);
      return {
        success: true,
        data: article,
        message: 'Article unpublished successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Patch(':id/like')
  async like(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<Article>> {
    try {
      const article = await this.articlesService.incrementLikes(id);
      return {
        success: true,
        data: article,
        message: 'Article liked successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Patch(':id/bookmark')
  async bookmark(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<Article>> {
    try {
      const article = await this.articlesService.incrementBookmarks(id);
      return {
        success: true,
        data: article,
        message: 'Article bookmarked successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<Article>> {
    try {
      const article = await this.articlesService.remove(id);
      return {
        success: true,
        data: article,
        message: 'Article deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 数据导入端点
  @Post('import')
  async importData(@Body() importData: ImportDataDto) {
    try {
      const results = await this.articleImportService.importData(importData);
      return {
        success: true,
        data: results,
        message: 'Data imported successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 清理所有数据端点（开发环境使用）
  @Delete('clear-all')
  async clearAllData() {
    try {
      const result = await this.articleImportService.clearAllData();
      return {
        success: true,
        data: result,
        message: 'All data cleared successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
