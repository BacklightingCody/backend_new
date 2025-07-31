import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatSessionDto, UpdateChatSessionDto, SendMessageDto } from './dto';
import { ChatSession, ChatMessage, ModelProvider, ChatMessageRole } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // ==================== ChatSession 管理 ====================

  async createSession(userId: number, createSessionDto: CreateChatSessionDto): Promise<ChatSession> {
    const { modelConfig, ...sessionData } = createSessionDto;

    return this.prisma.chatSession.create({
      data: {
        ...sessionData,
        userId,
        modelProvider: modelConfig.modelProvider,
        modelName: modelConfig.modelName,
        modelUrl: modelConfig.modelUrl,
        modelToken: modelConfig.modelToken,
        temperature: modelConfig.temperature,
        maxTokens: modelConfig.maxTokens,
        topP: modelConfig.topP,
        topK: modelConfig.topK,
        frequencyPenalty: modelConfig.frequencyPenalty,
        presencePenalty: modelConfig.presencePenalty,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findAllSessions(userId: number): Promise<ChatSession[]> {
    return this.prisma.chatSession.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1, // 只获取最后一条消息用于预览
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findSessionById(sessionId: string, userId: number): Promise<ChatSession> {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    return session;
  }

  async updateSession(sessionId: string, userId: number, updateSessionDto: UpdateChatSessionDto): Promise<ChatSession> {
    const session = await this.findSessionById(sessionId, userId);
    
    const { modelConfig, ...sessionData } = updateSessionDto;
    const updateData: any = { ...sessionData };

    if (modelConfig) {
      updateData.modelProvider = modelConfig.modelProvider;
      updateData.modelName = modelConfig.modelName;
      updateData.modelUrl = modelConfig.modelUrl;
      updateData.modelToken = modelConfig.modelToken;
      updateData.temperature = modelConfig.temperature;
      updateData.maxTokens = modelConfig.maxTokens;
      updateData.topP = modelConfig.topP;
      updateData.topK = modelConfig.topK;
      updateData.frequencyPenalty = modelConfig.frequencyPenalty;
      updateData.presencePenalty = modelConfig.presencePenalty;
    }

    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: updateData,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async deleteSession(sessionId: string, userId: number): Promise<void> {
    const session = await this.findSessionById(sessionId, userId);
    
    await this.prisma.chatSession.delete({
      where: { id: sessionId },
    });
  }

  // ==================== 消息管理 ====================

  async addMessage(sessionId: string, userId: number, role: ChatMessageRole, content: string, images?: string[]): Promise<ChatMessage> {
    // 验证会话存在
    await this.findSessionById(sessionId, userId);

    return this.prisma.chatMessage.create({
      data: {
        sessionId,
        userId,
        role,
        content,
        images: images || [],
      },
    });
  }

  // ==================== 模型调用 ====================

  async sendMessage(userId: number, sendMessageDto: SendMessageDto): Promise<any> {
    const { sessionId, messages, model, ...options } = sendMessageDto;

    let session: ChatSession | null = null;
    
    if (sessionId) {
      session = await this.findSessionById(sessionId, userId);
    }

    // 如果没有指定会话，需要根据模型名称查找或创建默认配置
    if (!session) {
      throw new BadRequestException('Session ID is required');
    }

    // 保存用户消息
    const userMessage = messages[messages.length - 1];
    if (userMessage.role === ChatMessageRole.USER) {
      await this.addMessage(sessionId!, userId, userMessage.role, userMessage.content);
    }

    // 调用模型API
    const response = await this.callModelAPI(session, messages, options);

    // 保存助手回复
    if (response.content) {
      await this.addMessage(sessionId!, userId, ChatMessageRole.ASSISTANT, response.content);
    }

    return response;
  }

  private async callModelAPI(session: ChatSession, messages: any[], options: any): Promise<any> {
    const { modelProvider, modelName, modelUrl, modelToken } = session;

    switch (modelProvider) {
      case ModelProvider.OPENAI:
        return this.callOpenAI(modelName, modelToken!, messages, options);
      case ModelProvider.CLAUDE:
        return this.callClaude(modelName, modelToken!, messages, options);
      case ModelProvider.CUSTOM:
        return this.callCustomModel(modelUrl!, modelToken!, messages, options);
      default:
        throw new BadRequestException(`Unsupported model provider: ${modelProvider}`);
    }
  }

  private async callOpenAI(model: string, token: string, messages: any[], options: any): Promise<any> {
    const url = 'https://api.openai.com/v1/chat/completions';
    
    try {
      const response = await axios.post(url, {
        model,
        messages,
        ...options,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        content: response.data.choices[0]?.message?.content || '',
        usage: response.data.usage,
      };
    } catch (error) {
      throw new BadRequestException(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  private async callClaude(model: string, token: string, messages: any[], options: any): Promise<any> {
    const url = 'https://api.anthropic.com/v1/messages';
    
    try {
      const response = await axios.post(url, {
        model,
        messages,
        max_tokens: options.max_tokens || 2048,
        ...options,
      }, {
        headers: {
          'x-api-key': token,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
      });

      return {
        content: response.data.content[0]?.text || '',
        usage: response.data.usage,
      };
    } catch (error) {
      throw new BadRequestException(`Claude API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  private async callCustomModel(url: string, token: string, messages: any[], options: any): Promise<any> {
    try {
      const response = await axios.post(url, {
        messages,
        ...options,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        content: response.data.choices?.[0]?.message?.content || response.data.content || '',
        usage: response.data.usage,
      };
    } catch (error) {
      throw new BadRequestException(`Custom model API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}
