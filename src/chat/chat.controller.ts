import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Req,
  Res,
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { CreateChatSessionDto, UpdateChatSessionDto, SendMessageDto } from './dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('chat')
// @UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ==================== 会话管理 ====================

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  async createSession(@CurrentUser() user: any, @Body() createSessionDto: CreateChatSessionDto) {
    const session = await this.chatService.createSession(user.id, createSessionDto);
    return {
      code: 200,
      message: '会话创建成功',
      data: session
    };
  }

  @Get('sessions')
  async findAllSessions(@CurrentUser() user: any) {
    const sessions = await this.chatService.findAllSessions(user.id);
    return {
      code: 200,
      message: '获取会话列表成功',
      data: sessions
    };
  }

  @Get('sessions/:id')
  async findSession(@CurrentUser() user: any, @Param('id') sessionId: string) {
    const session = await this.chatService.findSessionById(sessionId, user.id);
    return {
      code: 200,
      message: '获取会话详情成功',
      data: session
    };
  }

  @Put('sessions/:id')
  async updateSession(
    @CurrentUser() user: any, 
    @Param('id') sessionId: string, 
    @Body() updateSessionDto: UpdateChatSessionDto
  ) {
    const session = await this.chatService.updateSession(sessionId, user.id, updateSessionDto);
    return {
      code: 200,
      message: '会话更新成功',
      data: session
    };
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSession(@CurrentUser() user: any, @Param('id') sessionId: string) {
    await this.chatService.deleteSession(sessionId, user.id);
    return {
      code: 200,
      message: '会话删除成功'
    };
  }

  @Delete('sessions/:id/messages')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearSessionMessages(@CurrentUser() user: any, @Param('id') sessionId: string) {
    await this.chatService.clearSessionMessages(sessionId, user.id);
    return {
      code: 200,
      message: '会话消息清空成功'
    };
  }

  // ==================== 消息管理 ====================

  @Post('sessions/:id/messages')
  async addMessage(
    @CurrentUser() user: any,
    @Param('id') sessionId: string,
    @Body() body: { role: 'system' | 'user' | 'assistant'; content: string; images?: string[]; texts?: string[]; metadata?: any; rawContent?: string }
  ) {
    const msg = await this.chatService.addMessage(
      sessionId,
      user.id,
      body.role.toUpperCase() as any,
      body.content,
      body.images,
      body.texts,
      undefined,
      body.metadata,
      body.rawContent
    );
    return {
      code: 200,
      message: '消息保存成功',
      data: msg
    };
  }

  @Post('messages')
  async sendMessage(@CurrentUser() user: any, @Body() sendMessageDto: SendMessageDto) {
    const result = await this.chatService.sendMessage(user.id, sendMessageDto);
    return {
      code: 200,
      message: '消息发送成功',
      data: result
    };
  }

  @Delete('sessions/:sessionId/messages/:messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @CurrentUser() user: any, 
    @Param('sessionId') sessionId: string, 
    @Param('messageId') messageId: string
  ) {
    await this.chatService.deleteMessage(sessionId, messageId, user.id);
    return {
      code: 200,
      message: '消息删除成功'
    };
  }

  @Put('sessions/:sessionId/messages/:messageId')
  async editMessage(
    @CurrentUser() user: any,
    @Param('sessionId') sessionId: string,
    @Param('messageId') messageId: string,
    @Body() body: { content: string }
  ) {
    const message = await this.chatService.editMessage(sessionId, messageId, body.content, user.id);
    return {
      code: 200,
      message: '消息编辑成功',
      data: message
    };
  }

  // ==================== 系统提示词管理 ====================

  @Post('system-prompts')
  @HttpCode(HttpStatus.CREATED)
  async createSystemPrompt(@CurrentUser() user: any, @Body() prompt: { name: string; content: string; description?: string; isDefault?: boolean }) {
    const systemPrompt = await this.chatService.createSystemPrompt(user.id, prompt);
    return {
      code: 200,
      message: '系统提示词创建成功',
      data: systemPrompt
    };
  }

  @Get('system-prompts')
  async findAllSystemPrompts(@CurrentUser() user: any) {
    const prompts = await this.chatService.findAllSystemPrompts(user.id);
    return {
      code: 200,
      message: '获取系统提示词列表成功',
      data: prompts
    };
  }

  @Put('system-prompts/:id')
  async updateSystemPrompt(
    @CurrentUser() user: any,
    @Param('id') promptId: string,
    @Body() updates: { name?: string; content?: string; description?: string; isDefault?: boolean }
  ) {
    const prompt = await this.chatService.updateSystemPrompt(promptId, user.id, updates);
    return {
      code: 200,
      message: '系统提示词更新成功',
      data: prompt
    };
  }

  @Delete('system-prompts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSystemPrompt(@CurrentUser() user: any, @Param('id') promptId: string) {
    await this.chatService.deleteSystemPrompt(promptId, user.id);
    return {
      code: 200,
      message: '系统提示词删除成功'
    };
  }

  // ==================== 兼容性接口 ====================

  @Post('completion')
  async openaiCompatibleChat(
    @CurrentUser() user: any,
    @Body() body: any,
    @Query('stream') stream?: string,
    @Res() res?: Response
  ) {
    // OpenAI 兼容的接口
    const { model, messages, temperature, max_tokens, top_p, frequency_penalty, presence_penalty, top_k } = body;
    
    // 转换消息格式
    const lastMessage = messages[messages.length - 1];
    const sendMessageDto: SendMessageDto = {
      content: lastMessage.content,
      modelConfig: {
        model,
        temperature,
        maxTokens: max_tokens,
        topP: top_p,
        frequencyPenalty: frequency_penalty,
        presencePenalty: presence_penalty,
        topK: top_k
      }
    };

    if (stream === 'true') {
      // 流式响应
      if (!res) {
        throw new Error('Response object is required for streaming');
      }
      
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        const result = await this.chatService.sendMessage(user.id, sendMessageDto);
        const response = result.response;
        
        // 模拟流式输出
        const chunks = response.split(' ');
        for (const chunk of chunks) {
          const data = {
            id: `chatcmpl-${Date.now()}`,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [{
              index: 0,
              delta: { content: chunk + ' ' },
              finish_reason: null
            }]
          };
          
          res.write(`data: ${JSON.stringify(data)}\n\n`);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // 结束标记
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (error) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    } else {
      // 非流式响应
      const result = await this.chatService.sendMessage(user.id, sendMessageDto);
      
      const response = {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: result.response
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };
      
      return {
        code: 200,
        message: '请求成功',
        data: response
      };
    }
  }
}
