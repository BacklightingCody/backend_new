# 个人博客项目后端实现文档 - 第一阶段

## 概述

本文档记录了个人博客项目后端的初始实现，包括用户管理、文章管理、书籍管理和评论系统的完整功能。

## 技术栈

- **框架**: NestJS
- **数据库**: PostgreSQL (计划使用 Supabase)
- **ORM**: Prisma
- **认证**: Clerk (前端) + 自定义用户管理 (后端)
- **语言**: TypeScript

## 数据库模型设计

### 1. 用户模型 (User)
- 支持 Clerk 集成的用户同步
- 包含用户角色和状态管理
- 支持用户名、邮箱等基本信息

### 2. 文章模型 (Article)
- 支持 Markdown 内容和 HTML 缓存
- 包含发布状态、草稿状态管理
- 支持分类、标签、封面图等
- 包含点赞、收藏、评论计数
- 支持浏览次数统计

### 3. 书籍模型 (BookStack)
- 支持阅读进度管理 (0-100%)
- 包含评分系统 (0-10分)
- 支持书籍基本信息 (ISBN、出版社、页数等)
- 支持标签分类

### 4. 标签系统
- 文章标签 (Tag) 和书籍标签 (BookTag) 分离
- 支持标签颜色和描述
- 多对多关系实现

### 5. 评论系统 (Message)
- 基于文章的评论功能
- 支持用户权限控制
- 自动更新文章评论计数

## 已实现功能

### 用户管理 (UserModule)
- ✅ 用户 CRUD 操作
- ✅ Clerk 用户同步
- ✅ 用户状态管理 (ACTIVE/BANNED/PENDING)
- ✅ 用户统计信息
- ✅ 分页查询和搜索

### 文章管理 (ArticlesModule)
- ✅ 文章 CRUD 操作
- ✅ 发布/取消发布功能
- ✅ 标签管理
- ✅ 分类管理
- ✅ 点赞和收藏功能
- ✅ 浏览次数统计
- ✅ 热门文章和最新文章查询
- ✅ 高级搜索和过滤

### 书籍管理 (BookstackModule)
- ✅ 书籍 CRUD 操作
- ✅ 阅读进度管理
- ✅ 评分系统
- ✅ 标签管理
- ✅ 阅读统计
- ✅ 当前阅读、已完成、高评分书籍查询

### 评论系统 (MessageService)
- ✅ 评论 CRUD 操作
- ✅ 用户权限控制
- ✅ 分页查询
- ✅ 自动更新文章评论计数

## API 接口设计

### 用户接口 (/users)
- `GET /users` - 获取用户列表 (支持分页和搜索)
- `POST /users` - 创建用户
- `GET /users/:id` - 获取用户详情
- `PATCH /users/:id` - 更新用户信息
- `DELETE /users/:id` - 删除用户
- `GET /users/:id/stats` - 获取用户统计
- `POST /users/sync-clerk` - Clerk 用户同步

### 文章接口 (/articles)
- `GET /articles` - 获取文章列表 (支持高级搜索)
- `POST /articles` - 创建文章
- `GET /articles/:id` - 获取文章详情
- `GET /articles/slug/:slug` - 通过 slug 获取文章
- `PATCH /articles/:id` - 更新文章
- `DELETE /articles/:id` - 删除文章
- `PATCH /articles/:id/publish` - 发布文章
- `PATCH /articles/:id/like` - 点赞文章
- `GET /articles/popular` - 获取热门文章
- `GET /articles/categories` - 获取文章分类

### 书籍接口 (/bookstack)
- `GET /bookstack` - 获取书籍列表
- `POST /bookstack` - 添加书籍
- `GET /bookstack/:id` - 获取书籍详情
- `PATCH /bookstack/:id` - 更新书籍信息
- `PATCH /bookstack/:id/progress` - 更新阅读进度
- `PATCH /bookstack/:id/rating` - 更新书籍评分
- `GET /bookstack/stats` - 获取阅读统计
- `GET /bookstack/completed` - 获取已完成书籍

## 数据验证

使用 class-validator 进行数据验证：
- 字符串长度限制
- 数字范围验证
- 邮箱格式验证
- 枚举值验证
- 可选字段处理

## 错误处理

统一的错误处理机制：
- `NotFoundException` - 资源不存在
- `ConflictException` - 数据冲突 (如重复的 slug)
- `BadRequestException` - 请求参数错误
- `ForbiddenException` - 权限不足

## 响应格式

统一的 API 响应格式：
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

## 分页支持

所有列表接口都支持分页：
```typescript
interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

## 下一步计划

1. 实现认证和授权系统
2. 添加通用功能 (搜索、过滤、排序优化)
3. 集成 Clerk 认证
4. 添加文件上传功能
5. 实现缓存机制
6. 添加日志系统
7. 编写单元测试

## 文件结构

```
src/
├── user/                 # 用户模块
├── articles/             # 文章模块
├── bookstack/            # 书籍模块
├── common/               # 通用功能
│   ├── dto/             # 数据传输对象
│   └── services/        # 通用服务
├── prisma/              # Prisma 服务
├── types/               # 类型定义
└── config/              # 配置文件
```

## 注意事项

1. 所有模块都已集成 PrismaModule
2. 使用了统一的错误处理和响应格式
3. 支持 Clerk 用户同步但保持后端用户管理的独立性
4. 标签系统为文章和书籍分别设计，便于后续扩展
5. 所有删除操作都使用了级联删除保证数据一致性

---

**生成时间**: 2025-01-29
**版本**: v1.0.0
**状态**: 已完成基础实现
