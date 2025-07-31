import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req,
  Res,
  Query,
  HttpStatus,
  BadRequestException
} from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { CreateChatSessionDto, UpdateChatSessionDto, SendMessageDto } from './dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ==================== ChatSession 管理接口 ====================

  @Post('sessions')
  async createSession(@Req() req: any, @Body() createSessionDto: CreateChatSessionDto) {
    const userId = req.user.id;
    const session = await this.chatService.createSession(userId, createSessionDto);
    
    return {
      success: true,
      data: session,
      message: 'Chat session created successfully',
    };
  }

  @Get('sessions')
  async findAllSessions(@Req() req: any) {
    const userId = req.user.id;
    const sessions = await this.chatService.findAllSessions(userId);
    
    return {
      success: true,
      data: sessions,
      message: 'Chat sessions retrieved successfully',
    };
  }

  @Get('sessions/:id')
  async findSession(@Req() req: any, @Param('id') sessionId: string) {
    const userId = req.user.id;
    const session = await this.chatService.findSessionById(sessionId, userId);
    
    return {
      success: true,
      data: session,
      message: 'Chat session retrieved successfully',
    };
  }

  @Patch('sessions/:id')
  async updateSession(
    @Req() req: any, 
    @Param('id') sessionId: string, 
    @Body() updateSessionDto: UpdateChatSessionDto
  ) {
    const userId = req.user.id;
    const session = await this.chatService.updateSession(sessionId, userId, updateSessionDto);
    
    return {
      success: true,
      data: session,
      message: 'Chat session updated successfully',
    };
  }

  @Delete('sessions/:id')
  async deleteSession(@Req() req: any, @Param('id') sessionId: string) {
    const userId = req.user.id;
    await this.chatService.deleteSession(sessionId, userId);
    
    return {
      success: true,
      message: 'Chat session deleted successfully',
    };
  }

  // ==================== 消息发送接口 ====================

  @Post('completions')
  async sendMessage(
    @Req() req: any,
    @Body() sendMessageDto: SendMessageDto,
    @Query('stream') stream?: string,
    @Res() res?: Response
  ) {
    const userId = req.user.id;
    
    // 如果是流式请求
    if (stream === 'true' || sendMessageDto.stream) {
      return this.sendStreamMessage(userId, sendMessageDto, res!);
    }

    // 非流式请求
    try {
      const response = await this.chatService.sendMessage(userId, sendMessageDto);
      
      return res!.status(HttpStatus.OK).json({
        success: true,
        data: response,
        message: 'Message sent successfully',
      });
    } catch (error) {
      return res!.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: error.message,
        message: 'Failed to send message',
      });
    }
  }

  // ==================== SSE 流式响应 ====================

  private async sendStreamMessage(userId: number, sendMessageDto: SendMessageDto, res: Response) {
    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    try {
      // 发送开始事件
      res.write(`data: ${JSON.stringify({ type: 'start', message: 'Stream started' })}\n\n`);

      // 这里应该实现真正的流式调用
      // 目前先模拟流式响应
      const response = await this.chatService.sendMessage(userId, sendMessageDto);
      
      // 模拟分块发送
      const content = response.content || '';
      const chunks = this.splitIntoChunks(content, 10);
      
      for (const chunk of chunks) {
        res.write(`data: ${JSON.stringify({ 
          type: 'content', 
          content: chunk,
          delta: chunk 
        })}\n\n`);
        
        // 添加延迟模拟真实流式效果
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 发送结束事件
      res.write(`data: ${JSON.stringify({ 
        type: 'done', 
        message: 'Stream completed',
        usage: response.usage 
      })}\n\n`);
      
    } catch (error) {
      // 发送错误事件
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        error: error.message 
      })}\n\n`);
    } finally {
      res.end();
    }
  }

  private splitIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // ==================== 兼容 OpenAI 格式的接口 ====================

  @Post('v1/chat/completions')
  async openaiCompatibleChat(
    @Req() req: any,
    @Body() body: any,
    @Query('stream') stream?: string,
    @Res() res?: Response
  ) {
    // 转换为内部格式
    const sendMessageDto: SendMessageDto = {
      sessionId: body.sessionId,
      model: body.model,
      messages: body.messages,
      stream: body.stream || stream === 'true',
      temperature: body.temperature,
      max_tokens: body.max_tokens,
      top_p: body.top_p,
      frequency_penalty: body.frequency_penalty,
      presence_penalty: body.presence_penalty,
      top_k: body.top_k,
    };

    return this.sendMessage(req, sendMessageDto, stream, res);
  }
}
