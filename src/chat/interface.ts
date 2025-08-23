export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string | MessageContent[];
  timestamp: string;
  status: 'sending' | 'sent' | 'error' | 'canceled';
  // 用于界面显示的上下文信息（与发送到API的格式分离）
  images?: string[];
  texts?: string[];
  error?: string;
  metadata?: Record<string, any>;
  rawContent?: string;
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
 * 占位符结构，用于动态替换内容
 */
export interface PlaceholderItem {
  id: string;
  key: string;   // 替换占位名（如 doc、version、product）
  value: string; // 替换后的值
  type: 'doc' | 'img' | 'product' | 'language' | 'version' | 'gitCommitId' | 'fileMd5' | 'other';
  label?: string;
  description?: string;
}

/**
 * 发送消息请求
 */
export interface SendMessageRequest {
  content: string;                  // 可以包含占位符（如 @{{doc}}）
  images?: string[];
  texts?: string[];
  modelConfig?: ModelConfig;
  systemPrompt?: string;
  placeholders?: PlaceholderItem[]; // 占位符参数
  // 不在会话中追加一条新的用户消息（用于重试：复用原用户消息）
  suppressUserMessage?: boolean;
}

/**
 * 大模型配置参数
 */
export interface ModelConfig {
  model: string;
  temperature?: number;
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
  // 额外：占位符（后端可选处理，不直接传第三方厂商）
  placeholders?: Array<{ id?: string; key: string; value?: string; type?: string; label?: string }>;
  // 期望的流式格式（默认 sse）
  streamFormat?: 'sse' | 'json';
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
  messages: ChatMessage[];
  systemPrompt: string;
  modelConfig: ModelConfig;
  createdAt: string;
  updatedAt: string;
  sessionType?: 'public' | 'private';
  pinned?: boolean;
  isArchived?: boolean;
  tags?: string[];
  // 对比模式
  isModelCompare?: boolean;
  compareModels?: string[];
  messagesByModel?: Record<string, ChatMessage[]>;
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