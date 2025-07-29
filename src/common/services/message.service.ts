import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMessageDto, UpdateMessageDto } from '../dto/message.dto';
import { Message, Prisma } from '@prisma/client';
import { PaginationResult } from '../../types';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      // 检查文章是否存在
      const article = await this.prisma.article.findUnique({
        where: { id: createMessageDto.articleId },
      });

      if (!article) {
        throw new NotFoundException('Article not found');
      }

      // 检查用户是否存在
      const user = await this.prisma.user.findUnique({
        where: { id: createMessageDto.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 创建评论
      const message = await this.prisma.message.create({
        data: createMessageDto,
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
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });

      // 更新文章的评论数
      await this.prisma.article.update({
        where: { id: createMessageDto.articleId },
        data: {
          comments: {
            increment: 1,
          },
        },
      });

      return message;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create message');
    }
  }

  async findByArticle(
    articleId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginationResult<Message>> {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { articleId },
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
        },
      }),
      this.prisma.message.count({ where: { articleId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: messages,
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

  async findOne(id: number): Promise<Message> {
    const message = await this.prisma.message.findUnique({
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
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return message;
  }

  async update(id: number, updateMessageDto: UpdateMessageDto, userId: number): Promise<Message> {
    const message = await this.findOne(id);

    // 检查用户是否有权限更新这条消息
    if (message.userId !== userId) {
      throw new ForbiddenException('You can only update your own messages');
    }

    try {
      return await this.prisma.message.update({
        where: { id },
        data: updateMessageDto,
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
      });
    } catch (error) {
      throw new BadRequestException('Failed to update message');
    }
  }

  async remove(id: number, userId: number): Promise<Message> {
    const message = await this.findOne(id);

    // 检查用户是否有权限删除这条消息
    if (message.userId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    try {
      const deletedMessage = await this.prisma.message.delete({
        where: { id },
      });

      // 更新文章的评论数
      await this.prisma.article.update({
        where: { id: message.articleId },
        data: {
          comments: {
            decrement: 1,
          },
        },
      });

      return deletedMessage;
    } catch (error) {
      throw new BadRequestException('Failed to delete message');
    }
  }

  async findByUser(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginationResult<Message>> {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.message.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: messages,
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
}
