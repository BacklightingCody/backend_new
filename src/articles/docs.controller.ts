import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CategoriesService } from './categories.service';
import { ArticleQueryDto } from './dto/article-query.dto';
import { ApiResponse, PaginationResult } from '../types';

@Controller('docs')
export class DocsController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get('all')
  async getAllDocs(@Query() query: ArticleQueryDto): Promise<ApiResponse<any>> {
    try {
      const result = await this.articlesService.findAll({
        ...query,
        isPublished: true, // 只返回已发布的文档
      });

      // 转换为前端期望的格式
      const docs = result.data.map(article => ({
        id: article.id.toString(),
        title: article.title,
        content: article.content,
        category: article.category,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        author: (article as any).user?.username || (article as any).user?.firstName || 'Unknown',
        tags: (article as any).articleTags?.map((at: any) => at.tag.name) || [],
      }));

      return {
        success: true,
        data: {
          docs,
          total: result.pagination.total,
          page: result.pagination.page,
          pageSize: result.pagination.limit,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('categories')
  async getCategories(): Promise<ApiResponse<any>> {
    try {
      const categories = await this.categoriesService.findAll();
      return {
        success: true,
        data: {
          categories: categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            count: cat.count,
          })),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('categories/:categoryName')
  async getDocsByCategory(
    @Param('categoryName') categoryName: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<ApiResponse<any>> {
    try {
      const result = await this.categoriesService.getArticlesByCategory(
        decodeURIComponent(categoryName),
        {
          page: page || 1,
          limit: pageSize || 10,
        }
      );

      // 转换为前端期望的格式
      const docs = result.data.map(article => ({
        id: article.id.toString(),
        title: article.title,
        content: article.content,
        category: article.category,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        author: (article as any).user?.username || (article as any).user?.firstName || 'Unknown',
        tags: (article as any).articleTags?.map((at: any) => at.tag.name) || [],
      }));

      return {
        success: true,
        data: {
          docs,
          total: result.pagination.total,
          page: result.pagination.page,
          pageSize: result.pagination.limit,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('search')
  async searchDocs(
    @Query('q') query: string,
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<ApiResponse<any>> {
    try {
      const result = await this.articlesService.findAll({
        search: query,
        category,
        page: page || 1,
        limit: pageSize || 10,
        isPublished: true,
      });

      // 转换为前端期望的格式
      const docs = result.data.map(article => ({
        id: article.id.toString(),
        title: article.title,
        content: article.content,
        category: article.category,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        author: (article as any).user?.username || (article as any).user?.firstName || 'Unknown',
        tags: (article as any).articleTags?.map((at: any) => at.tag.name) || [],
      }));

      return {
        success: true,
        data: {
          docs,
          total: result.pagination.total,
          page: result.pagination.page,
          pageSize: result.pagination.limit,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get(':id')
  async getDocById(@Param('id') id: string): Promise<ApiResponse<any>> {
    try {
      const article = await this.articlesService.findOne(parseInt(id));
      
      const doc = {
        id: article.id.toString(),
        title: article.title,
        content: article.content,
        category: article.category,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        author: (article as any).user?.username || (article as any).user?.firstName || 'Unknown',
        tags: (article as any).articleTags?.map((at: any) => at.tag.name) || [],
      };

      return {
        success: true,
        data: doc,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}