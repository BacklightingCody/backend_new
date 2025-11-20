import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationResult } from '../types';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, description, color, icon } = createCategoryDto;
    
    // 生成 slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    try {
      // 检查名称和 slug 是否已存在
      const existingCategory = await this.prisma.$queryRaw`
        SELECT id FROM articles WHERE category = ${name} LIMIT 1
      `;

      if (Array.isArray(existingCategory) && existingCategory.length > 0) {
        throw new ConflictException('Category with this name already exists');
      }

      // 创建虚拟分类记录（用于统计）
      return {
        id: slug,
        name,
        slug,
        description: description || null,
        color: color || '#6B7280',
        icon: icon || null,
        count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('Failed to create category');
    }
  }

  async findAll() {
    try {
      // 从文章表中获取所有分类及其文章数量
      const categories = await this.prisma.$queryRaw`
        SELECT 
          category as name,
          category as slug,
          COUNT(*)::int as count,
          MIN(created_at) as "createdAt",
          MAX(updated_at) as "updatedAt"
        FROM articles 
        WHERE is_published = true 
        GROUP BY category 
        ORDER BY count DESC, category ASC
      `;

      return Array.isArray(categories) ? categories.map((cat: any) => ({
        id: cat.slug,
        name: cat.name,
        slug: cat.slug,
        description: null,
        color: '#6B7280',
        icon: null,
        count: cat.count,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      })) : [];
    } catch (error) {
      console.error('获取分类失败:', error);
      return [];
    }
  }

  async findBySlug(slug: string) {
    try {
      const category = await this.prisma.$queryRaw`
        SELECT 
          category as name,
          category as slug,
          COUNT(*)::int as count,
          MIN(created_at) as "createdAt",
          MAX(updated_at) as "updatedAt"
        FROM articles 
        WHERE category = ${slug} AND is_published = true 
        GROUP BY category
      `;

      if (!Array.isArray(category) || category.length === 0) {
        throw new NotFoundException(`Category with slug "${slug}" not found`);
      }

      const cat = category[0] as any;
      return {
        id: cat.slug,
        name: cat.name,
        slug: cat.slug,
        description: null,
        color: '#6B7280',
        icon: null,
        count: cat.count,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to find category');
    }
  }

  async getArticlesByCategory(
    categorySlug: string,
    options: { page: number; limit: number }
  ): Promise<PaginationResult<any>> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    try {
      const [articles, total] = await Promise.all([
        this.prisma.article.findMany({
          where: {
            category: categorySlug,
            isPublished: true,
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
            articleTags: {
              include: {
                tag: true,
              },
            },
            _count: {
              select: {
                messages: true,
              },
            },
          },
        }),
        this.prisma.article.count({
          where: {
            category: categorySlug,
            isPublished: true,
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: articles,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error('Failed to get articles by category');
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    // 由于我们使用的是基于文章表的虚拟分类，这里返回更新后的信息
    return {
      id,
      ...updateCategoryDto,
      updatedAt: new Date().toISOString(),
    };
  }

  async remove(id: string) {
    // 由于我们使用的是基于文章表的虚拟分类，这里返回删除信息
    return {
      id,
      message: 'Category reference removed',
    };
  }
}