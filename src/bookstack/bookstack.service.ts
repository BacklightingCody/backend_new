import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookStackDto } from './dto/create-bookstack.dto';
import { UpdateBookStackDto } from './dto/update-bookstack.dto';
import { BookStackQueryDto } from './dto/bookstack-query.dto';
import { BookStack, Prisma } from '@prisma/client';
import { PaginationResult } from '../types';

@Injectable()
export class BookstackService {
  constructor(private prisma: PrismaService) {}

  async create(createBookStackDto: CreateBookStackDto): Promise<BookStack> {
    const { tags, ...bookData } = createBookStackDto;

    try {
      // 检查 slug 是否已存在
      const existingBook = await this.prisma.bookStack.findUnique({
        where: { slug: createBookStackDto.slug },
      });

      if (existingBook) {
        throw new ConflictException('Book with this slug already exists');
      }

      // 创建书籍
      const book = await this.prisma.bookStack.create({
        data: {
          ...bookData,
          publishDate: bookData.publishDate ? new Date(bookData.publishDate) : undefined,
          bookTags: tags ? {
            create: await this.createOrConnectTags(tags),
          } : undefined,
        },
        include: {
          bookTags: {
            include: {
              bookTag: true,
            },
          },
        },
      });

      return book;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create book');
    }
  }

  private async createOrConnectTags(tagNames: string[]): Promise<{ bookTagId: number }[]> {
    const tagConnections: { bookTagId: number }[] = [];

    for (const tagName of tagNames) {
      // 查找或创建标签
      const tag = await this.prisma.bookTag.upsert({
        where: { name: tagName },
        update: {},
        create: {
          name: tagName,
          color: this.generateRandomColor(),
        },
      });

      tagConnections.push({
        bookTagId: tag.id,
      });
    }

    return tagConnections;
  }

  private generateRandomColor(): string {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33F1', '#F1FF33', '#33FFF1', '#FF8C33', '#8C33FF'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  async findAll(query: BookStackQueryDto): Promise<PaginationResult<BookStack>> {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      tags,
      isCompleted,
      minRating,
      maxRating,
      language,
      author,
      publisher,
      tag,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.BookStackWhereInput = {};

    // 搜索条件
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { publisher: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 过滤条件
    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (typeof isCompleted === 'boolean') where.isCompleted = isCompleted;
    if (language) where.language = language;
    if (author) where.author = { contains: author, mode: 'insensitive' };
    if (publisher) where.publisher = { contains: publisher, mode: 'insensitive' };

    // 评分过滤
    if (minRating !== undefined || maxRating !== undefined) {
      where.rating = {};
      if (minRating !== undefined) where.rating.gte = minRating;
      if (maxRating !== undefined) where.rating.lte = maxRating;
    }

    // 标签过滤
    if (tag || tags) {
      const tagFilter = tag ? [tag] : (typeof tags === 'string' ? tags.split(',') : tags);
      where.bookTags = {
        some: {
          bookTag: {
            name: {
              in: tagFilter,
            },
          },
        },
      };
    }

    const [books, total] = await Promise.all([
      this.prisma.bookStack.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          bookTags: {
            include: {
              bookTag: true,
            },
          },
        },
      }),
      this.prisma.bookStack.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: books,
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

  async findOne(id: number): Promise<BookStack> {
    const book = await this.prisma.bookStack.findUnique({
      where: { id },
      include: {
        bookTags: {
          include: {
            bookTag: true,
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async findBySlug(slug: string): Promise<BookStack> {
    const book = await this.prisma.bookStack.findUnique({
      where: { slug },
      include: {
        bookTags: {
          include: {
            bookTag: true,
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with slug "${slug}" not found`);
    }

    return book;
  }

  async update(id: number, updateBookStackDto: UpdateBookStackDto): Promise<BookStack> {
    const { tags, ...bookData } = updateBookStackDto;

    // 检查书籍是否存在
    await this.findOne(id);

    // 检查 slug 是否已被其他书籍使用
    if (updateBookStackDto.slug) {
      const existingBook = await this.prisma.bookStack.findUnique({
        where: { slug: updateBookStackDto.slug },
      });

      if (existingBook && existingBook.id !== id) {
        throw new ConflictException('Book with this slug already exists');
      }
    }

    try {
      // 如果提供了标签，先删除现有的标签关联
      if (tags) {
        await this.prisma.bookStackTag.deleteMany({
          where: { bookStackId: id },
        });
      }

      const book = await this.prisma.bookStack.update({
        where: { id },
        data: {
          ...bookData,
          publishDate: bookData.publishDate ? new Date(bookData.publishDate) : undefined,
          bookTags: tags ? {
            create: await this.createOrConnectTags(tags),
          } : undefined,
        },
        include: {
          bookTags: {
            include: {
              bookTag: true,
            },
          },
        },
      });

      return book;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to update book');
    }
  }

  async remove(id: number): Promise<BookStack> {
    // 检查书籍是否存在
    await this.findOne(id);

    try {
      return await this.prisma.bookStack.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete book');
    }
  }

  async updateProgress(id: number, progress: number): Promise<BookStack> {
    await this.findOne(id);

    const isCompleted = progress >= 100;

    return await this.prisma.bookStack.update({
      where: { id },
      data: {
        progress,
        isCompleted,
      },
    });
  }

  async updateRating(id: number, rating: number): Promise<BookStack> {
    await this.findOne(id);

    return await this.prisma.bookStack.update({
      where: { id },
      data: { rating },
    });
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.prisma.bookStack.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    return categories.map(c => c.category);
  }

  async getLanguages(): Promise<string[]> {
    const languages = await this.prisma.bookStack.findMany({
      select: {
        language: true,
      },
      distinct: ['language'],
      where: {
        language: {
          not: null,
        },
      },
    });

    return languages.map(l => l.language).filter(Boolean) as string[];
  }

  async getCompletedBooks(limit: number = 10): Promise<BookStack[]> {
    return await this.prisma.bookStack.findMany({
      where: {
        isCompleted: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      include: {
        bookTags: {
          include: {
            bookTag: true,
          },
        },
      },
    });
  }

  async getCurrentlyReading(limit: number = 10): Promise<BookStack[]> {
    return await this.prisma.bookStack.findMany({
      where: {
        isCompleted: false,
        progress: {
          gt: 0,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      include: {
        bookTags: {
          include: {
            bookTag: true,
          },
        },
      },
    });
  }

  async getTopRatedBooks(limit: number = 10): Promise<BookStack[]> {
    return await this.prisma.bookStack.findMany({
      where: {
        rating: {
          gt: 0,
        },
      },
      orderBy: [
        { rating: 'desc' },
        { updatedAt: 'desc' },
      ],
      take: limit,
      include: {
        bookTags: {
          include: {
            bookTag: true,
          },
        },
      },
    });
  }

  async getReadingStats() {
    const [totalBooks, completedBooks, currentlyReading, averageRating] = await Promise.all([
      this.prisma.bookStack.count(),
      this.prisma.bookStack.count({ where: { isCompleted: true } }),
      this.prisma.bookStack.count({
        where: {
          isCompleted: false,
          progress: { gt: 0 }
        }
      }),
      this.prisma.bookStack.aggregate({
        _avg: {
          rating: true,
        },
        where: {
          rating: {
            gt: 0,
          },
        },
      }),
    ]);

    return {
      totalBooks,
      completedBooks,
      currentlyReading,
      toReadBooks: totalBooks - completedBooks - currentlyReading,
      averageRating: averageRating._avg.rating || 0,
      completionRate: totalBooks > 0 ? (completedBooks / totalBooks) * 100 : 0,
    };
  }
}
