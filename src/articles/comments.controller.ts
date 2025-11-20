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
import { MessageService } from '../common/services/message.service';
import { CreateMessageDto, UpdateMessageDto } from '../common/dto/message.dto';
import { ApiResponse, PaginationResult } from '../types';
import { Message } from '@prisma/client';

@Controller('articles/:articleId/comments')
export class CommentsController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async create(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Body() createCommentDto: { content: string; userId: number }
  ): Promise<ApiResponse<Message>> {
    try {
      const messageDto: CreateMessageDto = {
        content: createCommentDto.content,
        articleId,
        userId: createCommentDto.userId,
      };
      
      const comment = await this.messageService.create(messageDto);
      return {
        success: true,
        data: comment,
        message: 'Comment created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get()
  async findAll(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ): Promise<ApiResponse<PaginationResult<Message>>> {
    try {
      const result = await this.messageService.findByArticle(articleId, page, limit);
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

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<Message>> {
    try {
      const comment = await this.messageService.findOne(id);
      return {
        success: true,
        data: comment,
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
    @Body() updateCommentDto: { content: string; userId: number }
  ): Promise<ApiResponse<Message>> {
    try {
      const messageDto: UpdateMessageDto = {
        content: updateCommentDto.content,
      };
      
      const comment = await this.messageService.update(id, messageDto, updateCommentDto.userId);
      return {
        success: true,
        data: comment,
        message: 'Comment updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() deleteDto: { userId: number }
  ): Promise<ApiResponse<Message>> {
    try {
      const comment = await this.messageService.remove(id, deleteDto.userId);
      return {
        success: true,
        data: comment,
        message: 'Comment deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 评论点赞功能（需要扩展MessageService或创建新的点赞服务）
  @Post(':id/like')
  async like(
    @Param('id', ParseIntPipe) id: number,
    @Body() likeDto: { userId: number }
  ): Promise<ApiResponse<any>> {
    try {
      // TODO: 实现点赞逻辑
      // 这里可以创建一个LikeService来管理点赞功能
      return {
        success: true,
        data: { liked: true },
        message: 'Comment liked successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}