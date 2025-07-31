# API参考文档

## 概述

本文档提供了Chat功能和实时活动监控功能的完整API参考。

## 认证

所有API请求都需要在请求头中包含JWT token：

```http
Authorization: Bearer <your-jwt-token>
```

## Chat API

### 会话管理

#### POST /chat/sessions
创建新的聊天会话

**请求体:**
```json
{
  "name": "string",
  "systemPrompt": "string (optional)",
  "modelConfig": {
    "modelProvider": "OPENAI | CLAUDE | GEMINI | QWEN | BAICHUAN | CHATGLM | CUSTOM",
    "modelName": "string",
    "modelUrl": "string (optional)",
    "modelToken": "string (optional)",
    "temperature": "number (optional, 0-2)",
    "maxTokens": "number (optional)",
    "topP": "number (optional, 0-1)",
    "topK": "number (optional)",
    "frequencyPenalty": "number (optional, -2 to 2)",
    "presencePenalty": "number (optional, -2 to 2)"
  },
  "shareAble": "boolean (optional)",
  "sessionType": "string (optional)",
  "documentId": "string (optional)",
  "productCode": "string (optional)"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "systemPrompt": "string",
    "userId": "number",
    "modelProvider": "string",
    "modelName": "string",
    "messages": [],
    "createdAt": "string",
    "updatedAt": "string"
  },
  "message": "Chat session created successfully"
}
```

#### GET /chat/sessions
获取用户的所有聊天会话

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "messages": [
        {
          "id": "string",
          "role": "USER | ASSISTANT | SYSTEM",
          "content": "string",
          "createdAt": "string"
        }
      ],
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "message": "Chat sessions retrieved successfully"
}
```

#### GET /chat/sessions/:id
获取指定的聊天会话

**路径参数:**
- `id`: 会话ID

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "messages": [
      {
        "id": "string",
        "role": "USER | ASSISTANT | SYSTEM",
        "content": "string",
        "images": ["string"],
        "createdAt": "string"
      }
    ],
    "modelConfig": {
      "modelProvider": "string",
      "modelName": "string",
      "temperature": "number"
    },
    "createdAt": "string",
    "updatedAt": "string"
  },
  "message": "Chat session retrieved successfully"
}
```

#### PATCH /chat/sessions/:id
更新聊天会话

**路径参数:**
- `id`: 会话ID

**请求体:**
```json
{
  "name": "string (optional)",
  "systemPrompt": "string (optional)",
  "modelConfig": {
    "temperature": "number (optional)",
    "maxTokens": "number (optional)"
  }
}
```

#### DELETE /chat/sessions/:id
删除聊天会话

**路径参数:**
- `id`: 会话ID

**响应:**
```json
{
  "success": true,
  "message": "Chat session deleted successfully"
}
```

### 消息发送

#### POST /chat/completions
发送聊天消息

**查询参数:**
- `stream`: "true" | "false" (可选，是否使用流式响应)

**请求体:**
```json
{
  "sessionId": "string (optional)",
  "model": "string",
  "messages": [
    {
      "role": "USER | ASSISTANT | SYSTEM",
      "content": "string"
    }
  ],
  "stream": "boolean (optional)",
  "temperature": "number (optional)",
  "max_tokens": "number (optional)",
  "top_p": "number (optional)",
  "frequency_penalty": "number (optional)",
  "presence_penalty": "number (optional)",
  "top_k": "number (optional)"
}
```

**非流式响应:**
```json
{
  "success": true,
  "data": {
    "content": "string",
    "usage": {
      "total_tokens": "number",
      "prompt_tokens": "number",
      "completion_tokens": "number"
    }
  },
  "message": "Message sent successfully"
}
```

**流式响应 (SSE):**
```
data: {"type": "start", "message": "Stream started"}

data: {"type": "content", "content": "Hello", "delta": "Hello"}

data: {"type": "content", "content": " world", "delta": " world"}

data: {"type": "done", "message": "Stream completed", "usage": {...}}
```

#### POST /chat/v1/chat/completions
OpenAI兼容的聊天接口

**请求体:** 与OpenAI API格式相同
**响应:** 与OpenAI API格式相同

## Activity API

### 活动记录

#### POST /activity/activities
上报用户活动

**请求体:**
```json
{
  "activityType": "APPLICATION_FOCUS | APPLICATION_BLUR | WINDOW_CHANGE | IDLE_START | IDLE_END | SYSTEM_LOCK | SYSTEM_UNLOCK",
  "applicationName": "string (optional)",
  "windowTitle": "string (optional)",
  "processName": "string (optional)",
  "operatingSystem": "string (optional)",
  "deviceName": "string (optional)",
  "ipAddress": "string (optional)",
  "userAgent": "string (optional)",
  "startTime": "string (ISO date)",
  "endTime": "string (optional, ISO date)",
  "duration": "number (optional, seconds)",
  "metadata": "object (optional)"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "activityType": "string",
    "applicationName": "string",
    "startTime": "string",
    "createdAt": "string"
  },
  "message": "Activity recorded successfully"
}
```

#### POST /activity/activities/batch
批量上报活动

**请求体:**
```json
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

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "success": true,
      "data": {
        "id": "string",
        "activityType": "string"
      }
    },
    {
      "success": false,
      "error": "error message"
    }
  ],
  "message": "Batch activities processed"
}
```

#### GET /activity/activities
获取用户活动列表

**查询参数:**
- `limit`: number (可选，默认50)
- `offset`: number (可选，默认0)
- `startDate`: string (可选，ISO日期)
- `endDate`: string (可选，ISO日期)

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "activityType": "string",
      "applicationName": "string",
      "windowTitle": "string",
      "startTime": "string",
      "duration": "number",
      "createdAt": "string"
    }
  ],
  "message": "Activities retrieved successfully"
}
```

#### GET /activity/activities/:id
获取指定活动

**路径参数:**
- `id`: 活动ID

#### PATCH /activity/activities/:id
更新活动

**路径参数:**
- `id`: 活动ID

#### DELETE /activity/activities/:id
删除活动

**路径参数:**
- `id`: 活动ID

### 状态管理

#### GET /activity/status
获取用户当前状态

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "number",
    "currentStatus": "ACTIVE | IDLE | OFFLINE",
    "lastActivity": "string",
    "currentApp": "string",
    "currentWindow": "string",
    "todayOnlineTime": "number",
    "totalOnlineTime": "number",
    "createdAt": "string",
    "updatedAt": "string"
  },
  "message": "User status retrieved successfully"
}
```

#### PATCH /activity/status
更新用户状态

**请求体:**
```json
{
  "currentStatus": "ACTIVE | IDLE | OFFLINE",
  "lastActivity": "string (optional, ISO date)",
  "currentApp": "string (optional)",
  "currentWindow": "string (optional)"
}
```

#### GET /activity/status/all
获取所有在线用户状态

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "number",
      "currentStatus": "ACTIVE",
      "currentApp": "Chrome",
      "lastActivity": "string",
      "user": {
        "id": "number",
        "username": "string",
        "firstName": "string",
        "lastName": "string",
        "imageUrl": "string"
      }
    }
  ],
  "message": "Active users retrieved successfully"
}
```

### 统计分析

#### GET /activity/stats
获取用户活动统计

**查询参数:**
- `date`: string (可选，ISO日期，默认今天)

**响应:**
```json
{
  "success": true,
  "data": {
    "totalActivities": "number",
    "totalDuration": "number",
    "applicationUsage": {
      "Chrome": "number",
      "VSCode": "number"
    },
    "activityTimeline": [
      {
        "time": "string",
        "type": "string",
        "app": "string",
        "duration": "number"
      }
    ],
    "mostUsedApp": "string"
  },
  "message": "Activity statistics retrieved successfully"
}
```

### 管理功能

#### POST /activity/cleanup
清理过期活动数据

**查询参数:**
- `days`: number (可选，保留天数，默认30)

**响应:**
```json
{
  "success": true,
  "data": {
    "deletedCount": "number"
  },
  "message": "Cleaned up X old activities"
}
```

## WebSocket Events

### 连接和认证

#### 连接
```javascript
const socket = io('ws://localhost:3000/activity');
```

#### 认证
```javascript
socket.emit('authenticate', {
  userId: number,
  token: string
});

socket.on('authenticated', (data) => {
  // { success: true, userId: number }
});

socket.on('auth_error', (data) => {
  // { message: string }
});
```

### 客户端发送事件

#### report_activity
上报活动
```javascript
socket.emit('report_activity', {
  activityType: 'APPLICATION_FOCUS',
  applicationName: 'Chrome',
  windowTitle: 'GitHub',
  startTime: '2024-01-01T10:00:00Z'
});
```

#### update_status
更新状态
```javascript
socket.emit('update_status', {
  currentStatus: 'ACTIVE',
  currentApp: 'Chrome',
  currentWindow: 'GitHub'
});
```

#### get_active_users
获取在线用户
```javascript
socket.emit('get_active_users');
```

#### subscribe_to_user
订阅用户活动
```javascript
socket.emit('subscribe_to_user', {
  targetUserId: 123
});
```

### 服务端推送事件

#### user_status_changed
用户状态变化
```javascript
socket.on('user_status_changed', (data) => {
  // {
  //   userId: number,
  //   status: string,
  //   currentApp: string,
  //   timestamp: string
  // }
});
```

#### activity_update
活动更新
```javascript
socket.on('activity_update', (data) => {
  // {
  //   userId: number,
  //   activityType: string,
  //   applicationName: string,
  //   timestamp: string
  // }
});
```

#### active_users
在线用户列表
```javascript
socket.on('active_users', (data) => {
  // {
  //   success: true,
  //   data: [UserActivityStatus]
  // }
});
```

## 错误响应

所有API在出错时返回统一格式：

```json
{
  "success": false,
  "error": "error_code",
  "message": "Human readable error message",
  "statusCode": 400
}
```

常见错误码：
- `401`: 未认证或token无效
- `403`: 权限不足
- `404`: 资源不存在
- `400`: 请求参数错误
- `500`: 服务器内部错误

## 限制和配额

- API请求频率限制：100请求/分钟
- WebSocket连接数限制：每用户5个连接
- 活动数据保留期：默认30天
- 单次批量上报活动数量：最多100条
