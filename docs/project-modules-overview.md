# 个人博客后端项目模块详细文档

## 项目概述

本项目是基于 NestJS 框架开发的个人博客后端系统，严格遵循 NestJS 官方文档的最佳实践和架构模式。项目采用模块化设计，每个模块负责特定的业务功能。

## 技术栈

- **框架**: NestJS 11+
- **语言**: TypeScript 5+
- **数据库**: PostgreSQL
- **ORM**: Prisma 6+
- **认证**: JWT + Clerk
- **验证**: class-validator + class-transformer
- **包管理**: pnpm

## 项目架构

```
src/
├── app.module.ts              # 根模块
├── main.ts                    # 应用入口
├── auth/                      # 认证模块
├── user/                      # 用户管理模块
├── articles/                  # 文章管理模块
├── bookstack/                 # 书籍管理模块
├── friend-link/               # 友链管理模块
├── common/                    # 通用功能模块
├── prisma/                    # 数据库服务模块
├── config/                    # 配置模块
└── types/                     # 类型定义
```

## 核心模块详解

### 1. 根模块 (AppModule)

**文件位置**: `src/app.module.ts`

**作用**: 应用程序的根模块，负责组织和配置所有功能模块

**功能**:
- 导入和配置所有功能模块
- 全局配置管理 (ConfigModule)
- 模块间依赖关系管理

**导入的模块**:
- `ConfigModule` - 环境变量配置
- `AuthModule` - 认证授权
- `UserModule` - 用户管理
- `ArticlesModule` - 文章管理
- `BookstackModule` - 书籍管理
- `FriendLinkModule` - 友链管理
- `CommonModule` - 通用功能
- `PrismaModule` - 数据库服务

### 2. 认证模块 (AuthModule)

**文件位置**: `src/auth/`

**作用**: 处理用户认证、授权和会话管理

**核心功能**:
- ✅ JWT Token 认证
- ✅ 用户注册和登录
- ✅ Clerk 用户同步
- ✅ Token 刷新机制
- ✅ 基于角色的权限控制 (RBAC)
- ✅ Session 管理

**主要组件**:
- `AuthController` - 认证相关接口
- `AuthService` - 认证业务逻辑
- `JwtUtils` - JWT 工具类
- `AuthGuard` - 认证守卫
- `OptionalAuthGuard` - 可选认证守卫

**API 接口**:
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/clerk-sync` - Clerk 用户同步
- `POST /auth/refresh` - 刷新 Token
- `GET /auth/profile` - 获取用户资料
- `POST /auth/logout` - 用户登出
- `POST /auth/verify-token` - 验证 Token

### 3. 用户管理模块 (UserModule)

**文件位置**: `src/user/`

**作用**: 管理用户信息和用户相关操作

**核心功能**:
- ✅ 用户 CRUD 操作
- ✅ 用户状态管理 (ACTIVE/BANNED/PENDING)
- ✅ 用户统计信息
- ✅ 分页查询和搜索
- ✅ Clerk 用户同步支持

**主要组件**:
- `UserController` - 用户接口控制器
- `UserService` - 用户业务逻辑
- `CreateUserDto` - 创建用户 DTO
- `UpdateUserDto` - 更新用户 DTO
- `QueryUserDto` - 查询用户 DTO

**API 接口**:
- `GET /users` - 获取用户列表
- `POST /users` - 创建用户
- `GET /users/:id` - 获取用户详情
- `PATCH /users/:id` - 更新用户信息
- `DELETE /users/:id` - 删除用户
- `GET /users/:id/stats` - 获取用户统计

### 4. 文章管理模块 (ArticlesModule)

**文件位置**: `src/articles/`

**作用**: 管理博客文章的创建、编辑、发布和查询

**核心功能**:
- ✅ 文章 CRUD 操作
- ✅ Markdown 内容支持
- ✅ 发布/草稿状态管理
- ✅ 标签和分类系统
- ✅ 点赞、收藏、浏览统计
- ✅ 热门文章和最新文章
- ✅ 高级搜索和过滤
- ✅ SEO 友好的 slug 支持

**主要组件**:
- `ArticlesController` - 文章接口控制器
- `ArticlesService` - 文章业务逻辑
- `CreateArticleDto` - 创建文章 DTO
- `UpdateArticleDto` - 更新文章 DTO
- `QueryArticleDto` - 查询文章 DTO

**API 接口**:
- `GET /articles` - 获取文章列表
- `POST /articles` - 创建文章
- `GET /articles/:id` - 获取文章详情
- `GET /articles/slug/:slug` - 通过 slug 获取文章
- `PATCH /articles/:id` - 更新文章
- `DELETE /articles/:id` - 删除文章
- `PATCH /articles/:id/publish` - 发布文章
- `PATCH /articles/:id/like` - 点赞文章
- `GET /articles/popular` - 获取热门文章
- `GET /articles/categories` - 获取文章分类

### 5. 书籍管理模块 (BookstackModule)

**文件位置**: `src/bookstack/`

**作用**: 管理个人阅读书籍的记录和进度跟踪

**核心功能**:
- ✅ 书籍 CRUD 操作
- ✅ 阅读进度管理 (0-100%)
- ✅ 评分系统 (0-10分)
- ✅ 书籍标签系统
- ✅ 阅读统计和分析
- ✅ 当前阅读、已完成书籍查询
- ✅ ISBN 支持

**主要组件**:
- `BookstackController` - 书籍接口控制器
- `BookstackService` - 书籍业务逻辑
- `CreateBookDto` - 创建书籍 DTO
- `UpdateBookDto` - 更新书籍 DTO
- `UpdateProgressDto` - 更新进度 DTO

**API 接口**:
- `GET /bookstack` - 获取书籍列表
- `POST /bookstack` - 添加书籍
- `GET /bookstack/:id` - 获取书籍详情
- `PATCH /bookstack/:id` - 更新书籍信息
- `PATCH /bookstack/:id/progress` - 更新阅读进度
- `PATCH /bookstack/:id/rating` - 更新书籍评分
- `GET /bookstack/stats` - 获取阅读统计
- `GET /bookstack/completed` - 获取已完成书籍

### 6. 友链管理模块 (FriendLinkModule)

**文件位置**: `src/friend-link/`

**作用**: 管理博客的友情链接

**核心功能**:
- ✅ 友链 CRUD 操作
- ✅ 友链状态管理
- ✅ 友链分类
- ✅ 链接有效性检查

**主要组件**:
- `FriendLinkController` - 友链接口控制器
- `FriendLinkService` - 友链业务逻辑

### 7. 通用功能模块 (CommonModule)

**文件位置**: `src/common/`

**作用**: 提供跨模块的通用功能和工具

**核心功能**:
- ✅ 统一错误处理
- ✅ 响应格式标准化
- ✅ 数据验证和转换
- ✅ 分页和搜索支持
- ✅ 通用装饰器
- ✅ 拦截器和过滤器

**主要组件**:
- `controllers/` - 通用控制器
- `services/` - 通用服务
- `dto/` - 通用数据传输对象
- `decorators/` - 自定义装饰器
- `filters/` - 异常过滤器
- `interceptors/` - 响应拦截器

### 8. 数据库服务模块 (PrismaModule)

**文件位置**: `src/prisma/`

**作用**: 提供数据库连接和 ORM 服务

**核心功能**:
- ✅ Prisma Client 配置
- ✅ 数据库连接管理
- ✅ 事务支持
- ✅ 数据库迁移支持

**主要组件**:
- `PrismaService` - Prisma 服务类
- `PrismaModule` - Prisma 模块配置

### 9. 配置模块 (ConfigModule)

**文件位置**: `src/config/`

**作用**: 管理应用程序配置和环境变量

**核心功能**:
- ✅ 环境变量管理
- ✅ 配置验证
- ✅ 多环境支持

### 10. 类型定义模块

**文件位置**: `src/types/`

**作用**: 定义全局类型和接口

**核心功能**:
- ✅ 全局类型定义
- ✅ API 响应类型
- ✅ 数据库模型类型

## NestJS 最佳实践遵循

### 1. 模块化设计
- 每个功能模块独立封装
- 明确的模块边界和职责
- 合理的依赖注入

### 2. 控制器设计
- RESTful API 设计
- 统一的路由命名
- 适当的 HTTP 状态码

### 3. 服务层设计
- 业务逻辑封装
- 单一职责原则
- 依赖注入模式

### 4. 数据传输对象 (DTO)
- 输入验证
- 数据转换
- API 文档生成

### 5. 异常处理
- 全局异常过滤器
- 统一错误响应格式
- 适当的错误日志

### 6. 中间件和守卫
- 认证和授权
- 请求预处理
- 响应后处理

### 7. 拦截器
- 响应格式统一
- 日志记录
- 性能监控

## 数据库设计

### 核心表结构
- `users` - 用户信息
- `articles` - 文章内容
- `book_stacks` - 书籍信息
- `tags` - 文章标签
- `book_tags` - 书籍标签
- `messages` - 评论信息
- `sessions` - 用户会话
- `friend_links` - 友情链接

### 关系设计
- 用户与文章：一对多
- 用户与书籍：一对多
- 文章与标签：多对多
- 书籍与标签：多对多

## 安全特性

### 认证安全
- JWT Token 验证
- 密码加密存储
- Session 管理
- Token 刷新机制

### 权限控制
- 基于角色的访问控制
- 资源级权限验证
- 用户状态检查

### 数据安全
- 输入数据验证
- SQL 注入防护
- XSS 防护
- CORS 配置

## 性能优化

### 数据库优化
- 索引优化
- 查询优化
- 分页支持
- 级联删除

### 应用优化
- 响应缓存
- 数据转换优化
- 异步处理

## 部署和运维

### 环境配置
- 多环境支持
- 环境变量管理
- 配置验证

### 监控和日志
- 全局异常处理
- 请求日志记录
- 性能监控

## 扩展建议

### 短期扩展
1. 文件上传功能
2. 邮件通知系统
3. API 文档 (Swagger)
4. 缓存层 (Redis)

### 长期扩展
1. 全文搜索 (Elasticsearch)
2. 实时通知 (WebSocket)
3. 内容推荐系统
4. 多语言支持

---

**文档版本**: v1.0.0
**更新时间**: 2025-01-29
**维护者**: 开发团队