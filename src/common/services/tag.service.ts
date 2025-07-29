import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Tag, BookTag, Prisma } from '@prisma/client';
import { PaginationResult } from '../../types';

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

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  // 文章标签管理
  async createArticleTag(createTagDto: CreateTagDto): Promise<Tag> {
    const slug = createTagDto.slug || this.generateSlug(createTagDto.name);

    try {
      // 检查名称和 slug 是否已存在
      const existingTag = await this.prisma.tag.findFirst({
        where: {
          OR: [
            { name: createTagDto.name },
            { slug },
          ],
        },
      });

      if (existingTag) {
        throw new ConflictException('Tag name or slug already exists');
      }

      return await this.prisma.tag.create({
        data: {
          ...createTagDto,
          slug,
          color: createTagDto.color || this.generateRandomColor(),
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create tag');
    }
  }

  async findAllArticleTags(query: TagQueryDto): Promise<PaginationResult<Tag>> {
    const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TagWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              articles: true,
            },
          },
        },
      }),
      this.prisma.tag.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: tags,
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

  async findArticleTagById(id: number): Promise<Tag> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }

  async updateArticleTag(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    await this.findArticleTagById(id);

    // 检查名称和 slug 是否已被其他标签使用
    if (updateTagDto.name || updateTagDto.slug) {
      const orConditions: Prisma.TagWhereInput[] = [];

      if (updateTagDto.name) {
        orConditions.push({ name: updateTagDto.name });
      }

      if (updateTagDto.slug) {
        orConditions.push({ slug: updateTagDto.slug });
      }

      const where: Prisma.TagWhereInput = {
        id: { not: id },
        OR: orConditions,
      };

      const existingTag = await this.prisma.tag.findFirst({ where });

      if (existingTag) {
        throw new ConflictException('Tag name or slug already exists');
      }
    }

    try {
      return await this.prisma.tag.update({
        where: { id },
        data: updateTagDto,
      });
    } catch (error) {
      throw new BadRequestException('Failed to update tag');
    }
  }

  async deleteArticleTag(id: number): Promise<Tag> {
    await this.findArticleTagById(id);

    try {
      return await this.prisma.tag.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete tag');
    }
  }

  // 书籍标签管理
  async createBookTag(createTagDto: Omit<CreateTagDto, 'slug' | 'description'>): Promise<BookTag> {
    try {
      const existingTag = await this.prisma.bookTag.findUnique({
        where: { name: createTagDto.name },
      });

      if (existingTag) {
        throw new ConflictException('Book tag name already exists');
      }

      return await this.prisma.bookTag.create({
        data: {
          ...createTagDto,
          color: createTagDto.color || this.generateRandomColor(),
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create book tag');
    }
  }

  async findAllBookTags(query: TagQueryDto): Promise<PaginationResult<BookTag>> {
    const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BookTagWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [tags, total] = await Promise.all([
      this.prisma.bookTag.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              bookTags: true,
            },
          },
        },
      }),
      this.prisma.bookTag.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: tags,
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

  async findBookTagById(id: number): Promise<BookTag> {
    const tag = await this.prisma.bookTag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookTags: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Book tag with ID ${id} not found`);
    }

    return tag;
  }

  async updateBookTag(id: number, updateTagDto: Omit<UpdateTagDto, 'slug' | 'description'>): Promise<BookTag> {
    await this.findBookTagById(id);

    if (updateTagDto.name) {
      const existingTag = await this.prisma.bookTag.findFirst({
        where: {
          name: updateTagDto.name,
          id: { not: id },
        },
      });

      if (existingTag) {
        throw new ConflictException('Book tag name already exists');
      }
    }

    try {
      return await this.prisma.bookTag.update({
        where: { id },
        data: updateTagDto,
      });
    } catch (error) {
      throw new BadRequestException('Failed to update book tag');
    }
  }

  async deleteBookTag(id: number): Promise<BookTag> {
    await this.findBookTagById(id);

    try {
      return await this.prisma.bookTag.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete book tag');
    }
  }

  // 工具方法
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private generateRandomColor(): string {
    const colors = [
      '#FF5733', '#33FF57', '#3357FF', '#FF33F1', '#F1FF33', 
      '#33FFF1', '#FF8C33', '#8C33FF', '#FF3333', '#33FF33',
      '#3333FF', '#FFFF33', '#FF33FF', '#33FFFF', '#FFA500',
      '#800080', '#008000', '#000080', '#800000', '#808000'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
