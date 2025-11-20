import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatSessionDto, UpdateChatSessionDto, SendMessageDto } from './dto';
import { ChatSession, ChatMessage, SystemPrompt, SendMessageRequest, PlaceholderItem } from './interface';
import { ChatMessageRole, ChatMessageStatus, ModelProvider } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  // ==================== 会话管理 ====================

  async createSession(userId: number, createSessionDto: CreateChatSessionDto): Promise<ChatSession> {
    const session = await this.prisma.chatSession.create({
      data: {
        name: createSessionDto.name,
        systemPrompt: createSessionDto.systemPrompt || '',
        userId,
        modelProvider: createSessionDto.modelConfig.modelProvider,
        modelName: createSessionDto.modelConfig.modelName,
        modelUrl: createSessionDto.modelConfig.modelUrl,
        modelToken: createSessionDto.modelConfig.modelToken,
        temperature: createSessionDto.modelConfig.temperature,
        maxTokens: createSessionDto.modelConfig.maxTokens,
        topP: createSessionDto.modelConfig.topP,
        topK: createSessionDto.modelConfig.topK,
        frequencyPenalty: createSessionDto.modelConfig.frequencyPenalty,
        presencePenalty: createSessionDto.modelConfig.presencePenalty,
        shareAble: createSessionDto.shareAble || false,
        sessionType: createSessionDto.sessionType || 'private',
        pinned: createSessionDto.pinned || false,
        isArchived: createSessionDto.isArchived || false,
        tags: createSessionDto.tags || [],
        isModelCompare: createSessionDto.isModelCompare || false,
        compareModels: createSessionDto.compareModels || [],
        documentId: createSessionDto.documentId,
        productCode: createSessionDto.productCode,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return this.mapSessionToInterface(session);
  }

  async findAllSessions(userId: number): Promise<ChatSession[]> {
    const sessions = await this.prisma.chatSession.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: [
        { pinned: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    return sessions.map(session => this.mapSessionToInterface(session));
  }

  async findSessionById(sessionId: string, userId: number): Promise<ChatSession> {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    return this.mapSessionToInterface(session);
  }

  async updateSession(sessionId: string, userId: number, updateSessionDto: UpdateChatSessionDto): Promise<ChatSession> {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    const updatedSession = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        name: updateSessionDto.name,
        systemPrompt: updateSessionDto.systemPrompt,
        modelProvider: updateSessionDto.modelConfig?.modelProvider,
        modelName: updateSessionDto.modelConfig?.modelName,
        modelUrl: updateSessionDto.modelConfig?.modelUrl,
        modelToken: updateSessionDto.modelConfig?.modelToken,
        temperature: updateSessionDto.modelConfig?.temperature,
        maxTokens: updateSessionDto.modelConfig?.maxTokens,
        topP: updateSessionDto.modelConfig?.topP,
        topK: updateSessionDto.modelConfig?.topK,
        frequencyPenalty: updateSessionDto.modelConfig?.frequencyPenalty,
        presencePenalty: updateSessionDto.modelConfig?.presencePenalty,
        shareAble: updateSessionDto.shareAble,
        sessionType: updateSessionDto.sessionType,
        pinned: updateSessionDto.pinned,
        isArchived: updateSessionDto.isArchived,
        tags: updateSessionDto.tags,
        isModelCompare: updateSessionDto.isModelCompare,
        compareModels: updateSessionDto.compareModels,
        documentId: updateSessionDto.documentId,
        productCode: updateSessionDto.productCode,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return this.mapSessionToInterface(updatedSession);
  }

  async deleteSession(sessionId: string, userId: number): Promise<void> {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    await this.prisma.chatSession.delete({
      where: { id: sessionId }
    });
  }

  // ==================== 消息管理 ====================

  async addMessage(
    sessionId: string, 
    userId: number, 
    role: ChatMessageRole, 
    content: string, 
    images?: string[],
    texts?: string[],
    error?: string,
    metadata?: any,
    rawContent?: string
  ): Promise<ChatMessage> {
    const message = await this.prisma.chatMessage.create({
      data: {
        role,
        content,
        images: images || [],
        texts: texts || [],
        error,
        metadata,
        rawContent,
        sessionId,
        userId,
        status: ChatMessageStatus.SENT
      }
    });

    return this.mapMessageToInterface(message);
  }

  async sendMessage(userId: number, sendMessageDto: SendMessageDto): Promise<any> {
    const { sessionId, content, images, texts, modelConfig, systemPrompt, placeholders, suppressUserMessage } = sendMessageDto;

    // 获取或创建会话
    let session;
    if (sessionId) {
      session = await this.findSessionById(sessionId, userId);
    } else {
      // 创建新会话
      const createSessionDto: CreateChatSessionDto = {
        name: '新对话',
        systemPrompt: systemPrompt || '',
        modelConfig: modelConfig ? {
          modelProvider: ModelProvider.GEMINI,
          modelName: modelConfig.model || 'gemini-2.0-flash',
          temperature: modelConfig.temperature || 0.7,
          maxTokens: modelConfig.maxTokens || 2048,
          topP: modelConfig.topP,
          topK: modelConfig.topK,
          frequencyPenalty: modelConfig.frequencyPenalty,
          presencePenalty: modelConfig.presencePenalty
        } : {
          modelProvider: ModelProvider.GEMINI,
          modelName: 'gemini-2.0-flash',
          temperature: 0.7,
          maxTokens: 2048
        }
      };
      session = await this.createSession(userId, createSessionDto);
    }

    // 处理占位符替换
    const processedContent = this.applyPlaceholders(content, placeholders || []);

    // 添加用户消息（如果不抑制）
    let userMessage: ChatMessage | null = null;
    if (!suppressUserMessage) {
      userMessage = await this.addMessage(
        session.id,
        userId,
        ChatMessageRole.USER,
        processedContent,
        images,
        texts,
        undefined,
        { placeholders },
        content // 保存原始内容
      );
    }

    try {
      // 调用AI模型
      const aiResponse = await this.callAIModel(session, processedContent, images, texts, systemPrompt);

      // 添加AI回复
      const aiMessage = await this.addMessage(
        session.id,
        userId,
        ChatMessageRole.ASSISTANT,
        aiResponse,
        [],
        [],
        undefined,
        { model: session.modelConfig.model }
      );

      // 更新会话时间
      await this.prisma.chatSession.update({
        where: { id: session.id },
        data: { updatedAt: new Date() }
      });

      return {
        sessionId: session.id,
        userMessage,
        aiMessage,
        response: aiResponse
      };

    } catch (error) {
      // 添加错误消息
      const errorMessage = await this.addMessage(
        session.id,
        userId,
        ChatMessageRole.ASSISTANT,
        `错误: ${error.message}`,
        [],
        [],
        error.message,
        { model: session.modelConfig.model }
      );

      throw error;
    }
  }

  async deleteMessage(sessionId: string, messageId: string, userId: number): Promise<void> {
    const message = await this.prisma.chatMessage.findFirst({
      where: { id: messageId, sessionId, userId }
    });

    if (!message) {
      throw new NotFoundException('消息不存在');
    }

    await this.prisma.chatMessage.delete({
      where: { id: messageId }
    });
  }

  async editMessage(sessionId: string, messageId: string, newContent: string, userId: number): Promise<ChatMessage> {
    const message = await this.prisma.chatMessage.findFirst({
      where: { id: messageId, sessionId, userId }
    });

    if (!message) {
      throw new NotFoundException('消息不存在');
    }

    const updatedMessage = await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { content: newContent }
    });

    return this.mapMessageToInterface(updatedMessage);
  }

  async clearSessionMessages(sessionId: string, userId: number): Promise<void> {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    await this.prisma.chatMessage.deleteMany({
      where: { sessionId }
    });

    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    });
  }

  // ==================== 系统提示词管理 ====================

  async createSystemPrompt(userId: number, prompt: Omit<SystemPrompt, 'id'>): Promise<SystemPrompt> {
    const systemPrompt = await this.prisma.systemPrompt.create({
      data: {
        name: prompt.name,
        content: prompt.content,
        description: prompt.description,
        isDefault: prompt.isDefault || false,
        userId
      }
    });

    return this.mapSystemPromptToInterface(systemPrompt);
  }

  async findAllSystemPrompts(userId: number): Promise<SystemPrompt[]> {
    const prompts = await this.prisma.systemPrompt.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return prompts.map(prompt => this.mapSystemPromptToInterface(prompt));
  }

  async updateSystemPrompt(promptId: string, userId: number, updates: Partial<Omit<SystemPrompt, 'id'>>): Promise<SystemPrompt> {
    const prompt = await this.prisma.systemPrompt.findFirst({
      where: { id: promptId, userId }
    });

    if (!prompt) {
      throw new NotFoundException('系统提示词不存在');
    }

    const updatedPrompt = await this.prisma.systemPrompt.update({
      where: { id: promptId },
      data: updates
    });

    return this.mapSystemPromptToInterface(updatedPrompt);
  }

  async deleteSystemPrompt(promptId: string, userId: number): Promise<void> {
    const prompt = await this.prisma.systemPrompt.findFirst({
      where: { id: promptId, userId }
    });

    if (!prompt) {
      throw new NotFoundException('系统提示词不存在');
    }

    await this.prisma.systemPrompt.delete({
      where: { id: promptId }
    });
  }

  // ==================== 工具方法 ====================

  private applyPlaceholders(content: string, placeholders: PlaceholderItem[]): string {
    let processedContent = content;
    
    for (const placeholder of placeholders) {
      const regex = new RegExp(`@\\{\\{${placeholder.key}\\}\\}`, 'g');
      processedContent = processedContent.replace(regex, placeholder.value);
    }
    
    return processedContent;
  }

  private async callAIModel(session: ChatSession, content: string, images?: string[], texts?: string[], systemPrompt?: string): Promise<string> {
    // 这里实现调用AI模型的逻辑
    // 目前返回模拟响应，实际项目中需要集成真实的AI API
    
    const modelName = session.modelConfig.model;
    
    // 模拟AI响应
    const responses = {
      'gemini-2.0-flash': `这是来自 Gemini 2.0 Flash 的回复：\n\n${content}\n\n我理解您的问题，让我为您提供详细的解答...`,
      'default': `这是AI助手的回复：\n\n${content}\n\n我已经理解了您的问题，以下是相关的解答...`
    };

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    return responses[modelName] || responses.default;
  }

  private mapSessionToInterface(session: any): ChatSession {
    return {
      id: session.id,
      name: session.name,
      messages: session.messages.map((msg: any) => this.mapMessageToInterface(msg)),
      systemPrompt: session.systemPrompt || '',
      modelConfig: {
        model: session.modelName,
        temperature: session.temperature,
        topK: session.topK,
        maxTokens: session.maxTokens,
        topP: session.topP,
        frequencyPenalty: session.frequencyPenalty,
        presencePenalty: session.presencePenalty,
        modelProvider: session.modelProvider,
        modelUrl: session.modelUrl
      },
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      sessionType: session.sessionType as 'public' | 'private',
      pinned: session.pinned,
      isArchived: session.isArchived,
      tags: session.tags,
      isModelCompare: session.isModelCompare,
      compareModels: session.compareModels,
      messagesByModel: {} // 对比模式的消息分组
    };
  }

  private mapMessageToInterface(message: any): ChatMessage {
    return {
      id: message.id,
      role: message.role.toLowerCase() as 'system' | 'user' | 'assistant',
      content: message.content,
      timestamp: message.createdAt.toISOString(),
      status: message.status.toLowerCase() as 'sending' | 'sent' | 'error' | 'canceled',
      images: message.images,
      texts: message.texts,
      error: message.error,
      metadata: message.metadata,
      rawContent: message.rawContent
    };
  }

  private mapSystemPromptToInterface(prompt: any): SystemPrompt {
    return {
      id: prompt.id,
      name: prompt.name,
      content: prompt.content,
      description: prompt.description,
      isDefault: prompt.isDefault
    };
  }
}
