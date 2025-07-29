import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { User, Prisma } from '@prisma/client';
import { PaginationResult, ClerkUser } from '../types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // 检查邮箱是否已存在
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // 检查 clerkId 是否已存在（如果提供）
      if (createUserDto.clerkId) {
        const existingClerkUser = await this.prisma.user.findUnique({
          where: { clerkId: createUserDto.clerkId },
        });

        if (existingClerkUser) {
          throw new ConflictException('User with this Clerk ID already exists');
        }
      }

      // 检查用户名是否已存在（如果提供）
      if (createUserDto.username) {
        const existingUsername = await this.prisma.user.findFirst({
          where: { username: createUserDto.username },
        });

        if (existingUsername) {
          throw new ConflictException('Username already taken');
        }
      }

      return await this.prisma.user.create({
        data: createUserDto,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  async findAll(query: UserQueryDto): Promise<PaginationResult<User>> {
    const { page = 1, limit = 10, search, role, status, email, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (status) where.status = status;
    if (email) where.email = { contains: email, mode: 'insensitive' };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          clerkId: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              articles: true,
              messages: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users as any[],
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

  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true,
            messages: true,
            sessions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { clerkId },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { username },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // 检查用户是否存在
    const existingUser = await this.findOne(id);

    // 检查用户名是否已被其他用户使用
    if (updateUserDto.username && updateUserDto.username !== existingUser.username) {
      const usernameExists = await this.prisma.user.findFirst({
        where: {
          username: updateUserDto.username,
          id: { not: id },
        },
      });

      if (usernameExists) {
        throw new ConflictException('Username already taken');
      }
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  async remove(id: number): Promise<User> {
    // 检查用户是否存在
    await this.findOne(id);

    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete user');
    }
  }

  // Clerk 集成相关方法
  async syncWithClerk(clerkUser: ClerkUser): Promise<User> {
    const existingUser = await this.findByClerkId(clerkUser.id);

    if (existingUser) {
      // 更新现有用户信息
      return await this.update(existingUser.id, {
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        username: clerkUser.username,
      });
    } else {
      // 创建新用户
      return await this.create({
        clerkId: clerkUser.id,
        email: clerkUser.email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        username: clerkUser.username,
      });
    }
  }

  async updateUserStatus(id: number, status: 'ACTIVE' | 'BANNED' | 'PENDING'): Promise<User> {
    await this.findOne(id);

    return await this.prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  async getUserStats(id: number) {
    const user = await this.findOne(id);

    const stats = await this.prisma.user.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            articles: {
              where: { isPublished: true },
            },
            messages: true,
          },
        },
        articles: {
          where: { isPublished: true },
          select: {
            likes: true,
            bookmarks: true,
            comments: true,
            viewCount: true,
          },
        },
      },
    });

    const totalLikes = stats?.articles.reduce((sum, article) => sum + article.likes, 0) || 0;
    const totalBookmarks = stats?.articles.reduce((sum, article) => sum + article.bookmarks, 0) || 0;
    const totalComments = stats?.articles.reduce((sum, article) => sum + article.comments, 0) || 0;
    const totalViews = stats?.articles.reduce((sum, article) => sum + article.viewCount, 0) || 0;

    return {
      user,
      stats: {
        articlesCount: stats?._count.articles || 0,
        commentsCount: stats?._count.messages || 0,
        totalLikes,
        totalBookmarks,
        totalComments,
        totalViews,
      },
    };
  }
}
