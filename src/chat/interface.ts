export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string | MessageContent[];
  timestamp: string;
  status: 'sending' | 'sent' | 'error' | 'canceled';
  // 用于界面显示的上下文信息（与发送到API的格式分离）
  images?: string[];
  texts?: string[];
}

/**
 * 消息内容项 - 支持多模态
 */
export interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

/**
 * 发送消息请求
 */
export interface SendMessageRequest {
  content: string;
  images?: string[]; // 图片 URL 数组
  texts?: string[]; // 文本上下文数组
  modelConfig?: ModelConfig;
  systemPromptId?: string;
}

/**
 * 大模型配置参数
 */
export interface ModelConfig {
  model: string;
  temperature?: number;
  token: string;
  topK?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  // 新增字段
  modelProvider?: 'OPENAI' | 'CLAUDE' | 'GEMINI' | 'QWEN' | 'BAICHUAN' | 'CHATGLM' | 'CUSTOM';
  modelUrl?: string;
}

/**
 * Chat Completion API 请求格式
 */
export interface ChatCompletionRequest {
  sessionId?: string;
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
  // 自定义扩展参数
  top_k?: number;
  useNewKey?: boolean;
}

/**
 * OpenAI 标准消息格式
 */
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | OpenAIMessageContent[];
}

export interface OpenAIMessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

export interface ChatSession {
  id: string;
  name: string;
  adminUser: string;
  messages: ChatMessage[];
  systemPrompt: string;
  modelConfig: ModelConfig;
  createdAt: string;
  updatedAt: string;
  sessionType?: 'product' | 'document';
  shareAble: boolean; // 会话是否共享
  // 新增字段
  documentId?: string;
  productCode?: string;
}

/**
 * 系统提示词
 */
export interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  description?: string;
  isDefault?: boolean;
}

// ==================== API 响应格式 ====================

/**
 * 标准 API 响应
 */
export interface ApiResponse {
  code: number;
  message: string;
  data: {
    answer: string;
  };
}