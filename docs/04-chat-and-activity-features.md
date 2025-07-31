# Chat功能和实时活动监控功能文档

## 概述

本文档介绍了新增的两个核心功能：

1. **Chat功能模块** - 支持多模型的聊天对话系统，包括SSE流式响应
2. **实时活动监控功能** - 实时监控和显示用户活动状态

## 1. Chat功能模块

### 1.1 功能特性

- ✅ **多模型支持**: 支持OpenAI、Claude、Gemini、国产模型等
- ✅ **会话管理**: 创建、保存、删除、查询聊天会话
- ✅ **SSE流式响应**: 实时流式返回模型生成内容
- ✅ **OpenAI兼容**: 完全兼容OpenAI API格式
- ✅ **多模态支持**: 支持文本和图片输入
- ✅ **自定义配置**: 支持自定义模型URL和认证token

### 1.2 数据库模型

#### ChatSession (聊天会话)

```typescript
interface ChatSession {
  id: string; // 会话ID
  name: string; // 会话名称
  systemPrompt?: string; // 系统提示词
  userId: number; // 用户ID

  // 模型配置
  modelProvider: ModelProvider; // 模型提供商
  modelName: string; // 模型名称
  modelUrl?: string; // 自定义模型URL
  modelToken?: string; // 模型认证token
  temperature?: number; // 温度参数
  maxTokens?: number; // 最大token数
  topP?: number; // Top-P参数
  topK?: number; // Top-K参数
  frequencyPenalty?: number; // 频率惩罚
  presencePenalty?: number; // 存在惩罚

  // 会话元数据
  shareAble: boolean; // 是否可分享
  sessionType?: string; // 会话类型
  documentId?: string; // 关联文档ID
  productCode?: string; // 产品代码

  messages: ChatMessage[]; // 消息列表
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### ChatMessage (聊天消息)

```typescript
interface ChatMessage {
  id: string;
  role: 'SYSTEM' | 'USER' | 'ASSISTANT';
  content: string;
  status: 'SENDING' | 'SENT' | 'ERROR' | 'CANCELED';
  images: string[]; // 图片URL数组
  sessionId: string; // 会话ID
  userId: number; // 用户ID
  tokenCount?: number; // token数量
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### 1.3 API接口

#### 会话管理接口

**创建会话**

```http
POST /chat/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新的聊天会话",
  "systemPrompt": "你是一个有用的AI助手",
  "modelConfig": {
    "modelProvider": "OPENAI",
    "modelName": "gpt-4",
    "modelToken": "sk-...",
    "temperature": 0.7,
    "maxTokens": 2048
  },
  "shareAble": false,
  "sessionType": "general"
}
```

**获取会话列表**

```http
GET /chat/sessions
Authorization: Bearer <token>
```

**获取单个会话**

```http
GET /chat/sessions/{sessionId}
Authorization: Bearer <token>
```

**更新会话**

```http
PATCH /chat/sessions/{sessionId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "更新的会话名称",
  "modelConfig": {
    "temperature": 0.8
  }
}
```

**删除会话**

```http
DELETE /chat/sessions/{sessionId}
Authorization: Bearer <token>
```

#### 消息发送接口

**发送消息 (非流式)**

```http
POST /chat/completions
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session_id",
  "model": "gpt-4",
  "messages": [
    {
      "role": "USER",
      "content": "你好，请介绍一下自己"
    }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 2048
}
```

**发送消息 (流式)**

```http
POST /chat/completions?stream=true
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session_id",
  "model": "gpt-4",
  "messages": [
    {
      "role": "USER",
      "content": "请写一首关于春天的诗"
    }
  ],
  "stream": true
}
```

**OpenAI兼容接口**

```http
POST /chat/v1/chat/completions
Authorization: Bearer <token>
Content-Type: application/json

{
  "model": "gpt-4",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "stream": true
}
```

### 1.4 SSE流式响应格式

流式响应使用Server-Sent Events (SSE)格式：

```
data: {"type": "start", "message": "Stream started"}

data: {"type": "content", "content": "你好", "delta": "你好"}

data: {"type": "content", "content": "！我是", "delta": "！我是"}

data: {"type": "done", "message": "Stream completed", "usage": {"total_tokens": 150}}
```

### 1.5 支持的模型提供商

| 提供商   | 模型示例                       | 配置说明                |
| -------- | ------------------------------ | ----------------------- |
| OpenAI   | gpt-4, gpt-3.5-turbo           | 需要OpenAI API Key      |
| Claude   | claude-3-opus, claude-3-sonnet | 需要Anthropic API Key   |
| Gemini   | gemini-pro                     | 需要Google API Key      |
| 通义千问 | qwen-turbo, qwen-plus          | 需要阿里云API Key       |
| 百川     | baichuan2-turbo                | 需要百川API Key         |
| ChatGLM  | chatglm-turbo                  | 需要智谱API Key         |
| 自定义   | 任意                           | 需要自定义URL和认证方式 |

## 2. 实时活动监控功能

### 2.1 功能特性

- ✅ **实时活动追踪**: 监控用户应用使用、窗口切换等活动
- ✅ **状态管理**: 在线、空闲、离线状态管理
- ✅ **WebSocket推送**: 实时推送活动状态变化
- ✅ **统计分析**: 应用使用时长、活动时间线等统计
- ✅ **批量上报**: 支持批量上报活动数据
- ✅ **数据清理**: 自动清理过期活动数据

### 2.2 数据库模型

#### UserActivity (用户活动)

```typescript
interface UserActivity {
  id: string;
  userId: number;

  // 活动信息
  activityType: ActivityType; // 活动类型
  applicationName?: string; // 应用名称
  windowTitle?: string; // 窗口标题
  processName?: string; // 进程名称

  // 系统信息
  operatingSystem?: string; // 操作系统
  deviceName?: string; // 设备名称
  ipAddress?: string; // IP地址
  userAgent?: string; // 用户代理

  // 时间信息
  startTime: DateTime; // 开始时间
  endTime?: DateTime; // 结束时间
  duration?: number; // 持续时间(秒)

  metadata?: any; // 额外数据
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### UserActivityStatus (用户状态)

```typescript
interface UserActivityStatus {
  id: string;
  userId: number;

  // 当前状态
  currentStatus: 'ACTIVE' | 'IDLE' | 'OFFLINE';
  lastActivity?: DateTime; // 最后活动时间

  // 当前活动信息
  currentApp?: string; // 当前应用
  currentWindow?: string; // 当前窗口

  // 统计信息
  todayOnlineTime: number; // 今日在线时长(秒)
  totalOnlineTime: number; // 总在线时长(秒)

  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### 2.3 活动类型

```typescript
enum ActivityType {
  APPLICATION_FOCUS = 'APPLICATION_FOCUS', // 应用获得焦点
  APPLICATION_BLUR = 'APPLICATION_BLUR', // 应用失去焦点
  WINDOW_CHANGE = 'WINDOW_CHANGE', // 窗口切换
  IDLE_START = 'IDLE_START', // 开始空闲
  IDLE_END = 'IDLE_END', // 结束空闲
  SYSTEM_LOCK = 'SYSTEM_LOCK', // 系统锁定
  SYSTEM_UNLOCK = 'SYSTEM_UNLOCK', // 系统解锁
}
```

### 2.4 REST API接口

#### 活动记录接口

**上报活动**

```http
POST /activity/activities
Authorization: Bearer <token>
Content-Type: application/json

{
  "activityType": "APPLICATION_FOCUS",
  "applicationName": "Visual Studio Code",
  "windowTitle": "main.ts - backend_new",
  "processName": "code",
  "operatingSystem": "macOS",
  "deviceName": "MacBook Pro",
  "startTime": "2024-01-01T10:00:00Z",
  "duration": 300
}
```

**批量上报活动**

```http
POST /activity/activities/batch
Authorization: Bearer <token>
Content-Type: application/json

[
  {
    "activityType": "APPLICATION_FOCUS",
    "applicationName": "Chrome",
    "startTime": "2024-01-01T10:00:00Z"
  },
  {
    "activityType": "WINDOW_CHANGE",
    "applicationName": "VSCode",
    "startTime": "2024-01-01T10:05:00Z"
  }
]
```

**获取活动列表**

```http
GET /activity/activities?limit=50&offset=0&startDate=2024-01-01&endDate=2024-01-02
Authorization: Bearer <token>
```

#### 状态管理接口

**获取用户状态**

```http
GET /activity/status
Authorization: Bearer <token>
```

**更新用户状态**

```http
PATCH /activity/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentStatus": "ACTIVE",
  "currentApp": "Visual Studio Code",
  "currentWindow": "编辑代码文件"
}
```

**获取所有在线用户**

```http
GET /activity/status/all
Authorization: Bearer <token>
```

#### 统计接口

**获取活动统计**

```http
GET /activity/stats?date=2024-01-01
Authorization: Bearer <token>
```

响应示例：

```json
{
  "success": true,
  "data": {
    "totalActivities": 156,
    "totalDuration": 28800,
    "applicationUsage": {
      "Visual Studio Code": 14400,
      "Chrome": 10800,
      "Slack": 3600
    },
    "mostUsedApp": "Visual Studio Code",
    "activityTimeline": [...]
  }
}
```

### 2.5 WebSocket实时推送

#### 连接和认证

```javascript
// 连接WebSocket
const socket = io('ws://localhost:3000/activity');

// 认证
socket.emit('authenticate', {
  userId: 123,
  token: 'your-jwt-token',
});

socket.on('authenticated', data => {
  console.log('认证成功:', data);
});
```

#### 事件监听

```javascript
// 监听用户状态变化
socket.on('user_status_changed', data => {
  console.log('用户状态变化:', data);
  // {
  //   userId: 123,
  //   status: 'ACTIVE',
  //   currentApp: 'Chrome',
  //   timestamp: '2024-01-01T10:00:00Z'
  // }
});

// 监听活动更新
socket.on('activity_update', data => {
  console.log('活动更新:', data);
});

// 获取在线用户列表
socket.emit('get_active_users');
socket.on('active_users', data => {
  console.log('在线用户:', data);
});
```

#### 上报活动

```javascript
// 上报活动
socket.emit('report_activity', {
  activityType: 'APPLICATION_FOCUS',
  applicationName: 'Chrome',
  windowTitle: 'GitHub - 项目页面',
  startTime: new Date().toISOString(),
});

// 更新状态
socket.emit('update_status', {
  currentStatus: 'ACTIVE',
  currentApp: 'Chrome',
  currentWindow: 'GitHub',
});
```

## 3. 部署和配置

### 3.1 环境变量

```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/blog_db"

# JWT配置
JWT_SECRET="your-jwt-secret"

# 应用配置
PORT=3000
NODE_ENV=development

# CORS配置
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

### 3.2 数据库迁移

```bash
# 生成Prisma客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev --name add-chat-and-activity-features

# 查看数据库
npx prisma studio
```

### 3.3 启动服务

```bash
# 开发环境
npm run start:dev

# 生产环境
npm run build
npm run start:prod
```

## 4. 客户端集成示例

### 4.1 Chat功能集成

```typescript
// 创建聊天会话
const createSession = async () => {
  const response = await fetch('/chat/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: '新的聊天',
      modelConfig: {
        modelProvider: 'OPENAI',
        modelName: 'gpt-4',
        modelToken: 'sk-...',
        temperature: 0.7,
      },
    }),
  });

  return response.json();
};

// 发送流式消息
const sendStreamMessage = async (sessionId: string, message: string) => {
  const response = await fetch('/chat/completions?stream=true', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      model: 'gpt-4',
      messages: [{ role: 'USER', content: message }],
      stream: true,
    }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));

        if (data.type === 'content') {
          console.log('收到内容:', data.content);
        } else if (data.type === 'done') {
          console.log('流式响应完成');
        }
      }
    }
  }
};
```

### 4.2 活动监控集成

```typescript
// 活动监控客户端
class ActivityMonitor {
  private socket: Socket;

  constructor(userId: number, token: string) {
    this.socket = io('ws://localhost:3000/activity');
    this.authenticate(userId, token);
    this.setupEventListeners();
  }

  private authenticate(userId: number, token: string) {
    this.socket.emit('authenticate', { userId, token });
  }

  private setupEventListeners() {
    // 监听状态变化
    this.socket.on('user_status_changed', data => {
      this.onStatusChanged(data);
    });

    // 监听活动更新
    this.socket.on('activity_update', data => {
      this.onActivityUpdate(data);
    });
  }

  // 上报应用切换
  reportAppSwitch(appName: string, windowTitle: string) {
    this.socket.emit('report_activity', {
      activityType: 'APPLICATION_FOCUS',
      applicationName: appName,
      windowTitle: windowTitle,
      startTime: new Date().toISOString(),
    });
  }

  // 更新状态
  updateStatus(status: 'ACTIVE' | 'IDLE' | 'OFFLINE', currentApp?: string) {
    this.socket.emit('update_status', {
      currentStatus: status,
      currentApp: currentApp,
    });
  }

  private onStatusChanged(data: any) {
    console.log('用户状态变化:', data);
    // 更新UI显示
  }

  private onActivityUpdate(data: any) {
    console.log('活动更新:', data);
    // 更新活动显示
  }
}

// 使用示例
const monitor = new ActivityMonitor(123, 'jwt-token');

// 监听窗口焦点变化
window.addEventListener('focus', () => {
  monitor.updateStatus('ACTIVE', document.title);
});

window.addEventListener('blur', () => {
  monitor.updateStatus('IDLE');
});
```

## 5. 安全考虑

### 5.1 认证和授权

- 所有API接口都需要JWT认证
- WebSocket连接需要token验证
- 用户只能访问自己的数据

### 5.2 数据隐私

- 活动数据仅记录必要信息
- 支持数据自动清理
- 敏感信息加密存储

### 5.3 API限制

- 实施请求频率限制
- 防止恶意数据上报
- 输入数据验证

## 6. 性能优化

### 6.1 数据库优化

- 添加必要的索引
- 定期清理历史数据
- 使用连接池

### 6.2 WebSocket优化

- 连接数限制
- 心跳检测
- 自动重连机制

### 6.3 缓存策略

- Redis缓存热点数据
- 会话状态缓存
- API响应缓存

## 7. 监控和日志

### 7.1 应用监控

- API响应时间监控
- WebSocket连接数监控
- 错误率监控

### 7.2 日志记录

- 结构化日志
- 错误日志收集
- 性能日志分析

## 8. 快速开始

### 8.1 启动服务

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.development
# 编辑 .env.development 文件

# 3. 运行数据库迁移
npx prisma migrate dev

# 4. 启动开发服务器
npm run start:dev
```

### 8.2 测试Chat功能

```bash
# 创建聊天会话
curl -X POST http://localhost:3000/chat/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试会话",
    "modelConfig": {
      "modelProvider": "OPENAI",
      "modelName": "gpt-3.5-turbo",
      "modelToken": "sk-your-openai-key"
    }
  }'

# 发送消息
curl -X POST http://localhost:3000/chat/completions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_id_from_above",
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "USER", "content": "Hello!"}]
  }'
```

### 8.3 测试活动监控

```bash
# 上报活动
curl -X POST http://localhost:3000/activity/activities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activityType": "APPLICATION_FOCUS",
    "applicationName": "Chrome",
    "windowTitle": "GitHub",
    "startTime": "2024-01-01T10:00:00Z"
  }'

# 获取用户状态
curl -X GET http://localhost:3000/activity/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 8.4 WebSocket连接测试

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Activity Monitor Test</title>
    <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
  </head>
  <body>
    <script>
      const socket = io('ws://localhost:3000/activity');

      socket.emit('authenticate', {
        userId: 1,
        token: 'your-jwt-token',
      });

      socket.on('authenticated', data => {
        console.log('认证成功:', data);
      });

      socket.on('user_status_changed', data => {
        console.log('状态变化:', data);
      });
    </script>
  </body>
</html>
```

## 9. 故障排除

### 9.1 常见问题

**Q: Chat功能返回401错误**
A: 检查JWT token是否有效，确保在请求头中正确设置Authorization

**Q: WebSocket连接失败**
A: 检查CORS配置，确保客户端域名在允许列表中

**Q: 模型API调用失败**
A: 检查模型token是否正确，网络是否可以访问模型API

**Q: 数据库连接错误**
A: 检查DATABASE_URL配置，确保PostgreSQL服务正在运行

### 9.2 调试技巧

```bash
# 查看应用日志
npm run start:dev

# 查看数据库数据
npx prisma studio

# 测试数据库连接
npx prisma db pull
```

这两个功能模块为系统提供了强大的聊天对话能力和实时活动监控能力，支持多种使用场景和集成方式。
