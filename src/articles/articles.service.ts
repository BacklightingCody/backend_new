import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleQueryDto } from './dto/article-query.dto';
import { Article, Prisma } from '@prisma/client';
import { PaginationResult } from '../types';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) { }

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const { tags, ...articleData } = createArticleDto;

    try {
      // 检查 slug 是否已存在
      const existingArticle = await this.prisma.article.findUnique({
        where: { slug: createArticleDto.slug },
      });

      if (existingArticle) {
        throw new ConflictException('Article with this slug already exists');
      }

      // 创建文章
      const article = await this.prisma.article.create({
        data: {
          ...articleData,
          articleTags: tags ? {
            create: await this.createOrConnectTags(tags),
          } : undefined,
        },
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
        },
      });

      return article;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create article');
    }
  }

  private async createOrConnectTags(tagNames: string[]): Promise<{ tagId: number }[]> {
    const tagConnections: { tagId: number }[] = [];

    for (const tagName of tagNames) {
      // 为标签创建 slug
      const slug = tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // 查找或创建标签
      const tag = await this.prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: {
          name: tagName,
          slug,
        },
      });

      tagConnections.push({
        tagId: tag.id,
      });
    }

    return tagConnections;
  }

  async findAll(query: ArticleQueryDto): Promise<PaginationResult<Article>> {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      tags,
      userId,
      isPublished,
      isDraft,
      author,
      tag,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.ArticleWhereInput = {};

    // 搜索条件
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 过滤条件
    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (userId) where.userId = userId;
    if (typeof isPublished === 'boolean') where.isPublished = isPublished;
    if (typeof isDraft === 'boolean') where.isDraft = isDraft;

    // 作者过滤 - 暂时注释掉，返回所有文章
    // if (author) {
    //   where.user = {
    //     OR: [
    //       { username: { contains: author, mode: 'insensitive' } },
    //       { firstName: { contains: author, mode: 'insensitive' } },
    //       { lastName: { contains: author, mode: 'insensitive' } },
    //     ],
    //   };
    // }

    // 标签过滤
    if (tag || tags) {
      const tagFilter = tag ? [tag] : (typeof tags === 'string' ? tags.split(',') : tags);
      where.articleTags = {
        some: {
          tag: {
            name: {
              in: tagFilter,
            },
          },
        },
      };
    }

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
      this.prisma.article.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // 打印返回的文章标题
    console.log('返回的文章标题:', articles.map(article => article.title))
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
  }

  async findOne(id: number): Promise<Article> {
    const article = await this.prisma.article.findUnique({
      where: { id },
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
        messages: {
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
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return article;
  }

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
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
        messages: {
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
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    // 增加浏览次数
    await this.prisma.article.update({
      where: { slug },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return article;
  }

  async update(id: number, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const { tags, ...articleData } = updateArticleDto;

    // 检查文章是否存在
    await this.findOne(id);

    // 检查 slug 是否已被其他文章使用
    if (updateArticleDto.slug) {
      const existingArticle = await this.prisma.article.findUnique({
        where: { slug: updateArticleDto.slug },
      });

      if (existingArticle && existingArticle.id !== id) {
        throw new ConflictException('Article with this slug already exists');
      }
    }

    try {
      // 如果提供了标签，先删除现有的标签关联
      if (tags) {
        await this.prisma.articleTag.deleteMany({
          where: { articleId: id },
        });
      }

      const article = await this.prisma.article.update({
        where: { id },
        data: {
          ...articleData,
          articleTags: tags ? {
            create: await this.createOrConnectTags(tags),
          } : undefined,
        },
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
        },
      });

      return article;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to update article');
    }
  }

  async remove(id: number): Promise<Article> {
    // 检查文章是否存在
    await this.findOne(id);

    try {
      return await this.prisma.article.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete article');
    }
  }

  async publish(id: number): Promise<Article> {
    await this.findOne(id);

    return await this.prisma.article.update({
      where: { id },
      data: {
        isPublished: true,
        isDraft: false,
      },
    });
  }

  async unpublish(id: number): Promise<Article> {
    await this.findOne(id);

    return await this.prisma.article.update({
      where: { id },
      data: {
        isPublished: false,
        isDraft: true,
      },
    });
  }

  async incrementLikes(id: number): Promise<Article> {
    await this.findOne(id);

    return await this.prisma.article.update({
      where: { id },
      data: {
        likes: {
          increment: 1,
        },
      },
    });
  }

  async incrementBookmarks(id: number): Promise<Article> {
    await this.findOne(id);

    return await this.prisma.article.update({
      where: { id },
      data: {
        bookmarks: {
          increment: 1,
        },
      },
    });
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.prisma.article.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
      where: {
        isPublished: true,
      },
    });

    return categories.map(c => c.category);
  }

  async getPopularArticles(limit: number = 10): Promise<Article[]> {
    return await this.prisma.article.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [
        { likes: 'desc' },
        { viewCount: 'desc' },
        { bookmarks: 'desc' },
      ],
      take: limit,
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
      },
    });
  }

  async getRecentArticles(limit: number = 10): Promise<Article[]> {
    return await this.prisma.article.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
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
      },
    });
  }
}
