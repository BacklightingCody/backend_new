# 个人博客项目后端实现文档 - 第二阶段

## 概述

本文档记录了个人博客项目后端的第二阶段实现，主要包括认证授权系统、通用功能模块和系统优化。

## 新增功能

### 1. 认证和授权系统 (AuthModule)

#### JWT 认证实现
- **JWT 工具类** (`JwtUtils`): 提供 token 生成、验证、刷新等功能
- **密码加密**: 使用 bcryptjs 进行密码哈希处理
- **Token 管理**: 支持 Access Token (15分钟) 和 Refresh Token (7天)

#### 认证守卫
- **AuthGuard**: 强制认证守卫，验证用户身份和权限
- **OptionalAuthGuard**: 可选认证守卫，不强制要求认证
- **角色权限控制**: 支持基于角色的访问控制 (RBAC)

#### 认证接口
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/clerk-sync` - Clerk 用户同步
- `POST /auth/refresh` - 刷新 Access Token
- `GET /auth/profile` - 获取用户资料
- `POST /auth/logout` - 用户登出
- `POST /auth/verify-token` - 验证 Token

#### Session 管理
- 数据库存储 Refresh Token
- 自动清理过期 Session
- 支持多设备登录管理

### 2. 通用功能模块 (CommonModule)

#### 标签管理系统
- **文章标签管理**: 支持名称、slug、颜色、描述
- **书籍标签管理**: 简化的标签系统
- **标签统计**: 显示标签使用次数
- **批量操作**: 支持标签的批量管理

#### 评论系统增强
- **MessageService**: 统一的评论管理服务
- **权限控制**: 用户只能编辑/删除自己的评论
- **自动计数**: 自动更新文章评论数量
- **分页查询**: 支持按文章和用户查询评论

#### 通用装饰器
- **@CurrentUser**: 获取当前登录用户信息
- **@UserId**: 获取当前用户 ID
- **@Public**: 标记公开接口
- **@Roles**: 角色权限控制

### 3. 系统优化

#### 全局异常处理
- **AllExceptionsFilter**: 统一异常处理过滤器
- **错误日志记录**: 自动记录系统错误
- **友好错误响应**: 统一的错误响应格式

#### 响应拦截器
- **ResponseInterceptor**: 统一响应格式
- **自动包装**: 自动将返回数据包装成 ApiResponse 格式
- **时间戳**: 自动添加响应时间戳

#### 数据验证
- **ValidationPipe**: 全局数据验证管道
- **DTO 验证**: 使用 class-validator 进行数据验证
- **类型转换**: 自动类型转换和清理

## 技术实现细节

### 认证流程

1. **用户注册/登录**
   ```typescript
   // 注册流程
   register() -> 验证邮箱唯一性 -> 加密密码 -> 创建用户 -> 生成 Token -> 创建 Session
   
   // 登录流程
   login() -> 验证用户存在 -> 验证密码 -> 检查用户状态 -> 生成 Token -> 创建 Session
   ```

2. **Clerk 集成**
   ```typescript
   // Clerk 同步流程
   clerkSync() -> 查找现有用户 -> 更新/创建用户 -> 生成 Token -> 创建 Session
   ```

3. **Token 刷新**
   ```typescript
   // Token 刷新流程
   refresh() -> 验证 Refresh Token -> 检查 Session -> 验证用户状态 -> 生成新 Access Token
   ```

### 权限控制

```typescript
// 角色定义
enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

// 使用示例
@UseGuards(AuthGuard)
@Roles('ADMIN')
@Post('admin-only')
async adminOnlyEndpoint() {
  // 只有管理员可以访问
}
```

### 标签系统架构

```typescript
// 文章标签
interface ArticleTag {
  id: number;
  name: string;
  slug: string;
  color?: string;
  description?: string;
}

// 书籍标签
interface BookTag {
  id: number;
  name: string;
  color?: string;
}
```

## API 接口更新

### 认证接口 (/auth)
- ✅ 完整的认证流程
- ✅ JWT Token 管理
- ✅ Clerk 集成
- ✅ Session 管理

### 标签接口 (/tags)
- `GET /tags/articles` - 获取文章标签列表
- `POST /tags/articles` - 创建文章标签 (需要管理员权限)
- `GET /tags/articles/:id` - 获取文章标签详情
- `PATCH /tags/articles/:id` - 更新文章标签 (需要管理员权限)
- `DELETE /tags/articles/:id` - 删除文章标签 (需要管理员权限)
- `GET /tags/books` - 获取书籍标签列表
- `POST /tags/books` - 创建书籍标签 (需要管理员权限)

## 安全特性

### 密码安全
- 使用 bcryptjs 进行密码哈希
- Salt rounds: 12
- 不存储明文密码

### Token 安全
- JWT 签名验证
- Token 过期时间控制
- Refresh Token 轮换

### 权限控制
- 基于角色的访问控制 (RBAC)
- 接口级权限验证
- 用户状态检查

### 数据验证
- 输入数据验证和清理
- SQL 注入防护 (Prisma ORM)
- XSS 防护

## 配置要求

### 环境变量
```env
# JWT 配置
JWT_SECRET=your-super-secret-jwt-key

# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/blog_db

# 应用配置
PORT=3000
NODE_ENV=development
```

### 依赖包
```json
{
  "dependencies": {
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.5",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "bcryptjs": "^3.0.2"
  }
}
```

## 错误处理

### 统一错误响应格式
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
}
```

### 常见错误类型
- `UnauthorizedException` - 认证失败
- `ForbiddenException` - 权限不足
- `ConflictException` - 数据冲突
- `NotFoundException` - 资源不存在
- `BadRequestException` - 请求参数错误

## 性能优化

### 数据库优化
- 添加必要的索引
- 使用 Prisma 查询优化
- 级联删除配置

### 缓存策略
- JWT Token 验证缓存
- 用户信息缓存
- 标签数据缓存

## 测试建议

### 认证测试
1. 用户注册和登录流程
2. Token 生成和验证
3. 权限控制测试
4. Session 管理测试

### API 测试
1. 所有接口的正常流程
2. 错误处理测试
3. 权限验证测试
4. 数据验证测试

## 部署注意事项

1. **环境变量配置**: 确保所有必要的环境变量已设置
2. **数据库迁移**: 运行 Prisma 迁移
3. **JWT 密钥**: 生产环境使用强密钥
4. **CORS 配置**: 根据前端域名配置 CORS
5. **HTTPS**: 生产环境启用 HTTPS

## 下一步计划

1. 添加文件上传功能
2. 实现邮件通知系统
3. 添加缓存层 (Redis)
4. 实现 API 限流
5. 添加监控和日志系统
6. 编写完整的单元测试
7. 添加 API 文档 (Swagger)

---

**生成时间**: 2025-01-29
**版本**: v2.0.0
**状态**: 认证和通用功能完成
