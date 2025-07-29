# 后端开发规范

## 📁 项目结构规范

```
src/
├── app.module.ts         # 根模块
├── main.ts               # 应用入口
├── modules/              # 功能模块
│   ├── auth/            # 认证模块
│   ├── user/            # 用户模块
│   ├── articles/        # 文章模块
│   ├── bookstack/       # 书栈模块
│   └── friend-link/     # 友链模块
├── common/              # 公共模块
│   ├── decorators/      # 装饰器
│   ├── filters/         # 异常过滤器
│   ├── interceptors/    # 拦截器
│   ├── pipe/            # 管道
│   ├── utils/           # 工具函数
│   └── constant/        # 常量定义
├── config/              # 配置模块
├── prisma/              # Prisma 服务
└── types/               # 类型定义
```

## 📝 命名规范

### 文件命名
- 模块文件: `module-name.module.ts`
- 控制器: `controller-name.controller.ts`
- 服务: `service-name.service.ts`
- DTO: `dto-name.dto.ts`
- 实体: `entity-name.entity.ts`
- 测试文件: `file-name.spec.ts`

### 类命名
- 模块: `ModuleNameModule`
- 控制器: `ControllerNameController`
- 服务: `ServiceNameService`
- DTO: `CreateEntityDto`, `UpdateEntityDto`
- 实体: `EntityName`

### 方法命名
- 控制器方法: `findAll()`, `findOne()`, `create()`, `update()`, `remove()`
- 服务方法: 业务语义化命名
- 私有方法: `_methodName()`

## 🛠️ 技术栈规范

### 核心技术
- **框架**: NestJS 11+
- **语言**: TypeScript 5+
- **数据库**: PostgreSQL
- **ORM**: Prisma 6+
- **包管理**: pnpm

### 中间件和工具
- **认证**: JWT + Clerk
- **验证**: class-validator
- **转换**: class-transformer
- **文档**: Swagger (可选)
- **测试**: Jest

## 🏗️ 模块设计规范

### 模块结构
```
module-name/
├── module-name.module.ts      # 模块定义
├── module-name.controller.ts  # 控制器
├── module-name.service.ts     # 服务
├── dto/                       # 数据传输对象
│   ├── create-entity.dto.ts
│   ├── update-entity.dto.ts
│   └── query-entity.dto.ts
├── entities/                  # 实体定义
│   └── entity.entity.ts
└── module-name.controller.spec.ts
```

### 模块职责
- **Controller**: 处理 HTTP 请求和响应
- **Service**: 业务逻辑处理
- **Repository**: 数据访问层 (Prisma Service)
- **DTO**: 数据验证和转换
- **Entity**: 数据模型定义

## 🌐 API 设计规范

### RESTful 路由
```typescript
@Controller('articles')
export class ArticlesController {
  @Get()           // GET /articles
  @Get(':id')      // GET /articles/:id
  @Post()          // POST /articles
  @Put(':id')      // PUT /articles/:id
  @Delete(':id')   // DELETE /articles/:id
}
```

### HTTP 状态码
- `200`: 成功返回数据
- `201`: 成功创建资源
- `204`: 成功无返回内容
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 无权限
- `404`: 资源不存在
- `422`: 验证失败
- `500`: 服务器错误

### 响应格式
```typescript
// 成功响应
interface ApiResponse<T> {
  success: true
  data: T
  message?: string
  meta?: PaginationMeta
}

// 错误响应
interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}
```

## 🔍 数据验证规范

### DTO 验证
```typescript
export class CreateArticleDto {
  @IsString()
  @Length(1, 256)
  @ApiProperty({ description: '文章标题' })
  title: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '文章内容' })
  content: string

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '文章摘要', required: false })
  summary?: string

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: '标签列表' })
  tags: string[]
}
```

### 验证规则
- 所有输入参数必须验证
- 使用 `class-validator` 装饰器
- 自定义验证器放在 `common/validators`
- 错误信息国际化

## 🗄️ 数据库设计规范

### Prisma Schema 规范
```prisma
model Article {
  id        Int      @id @default(autoincrement())
  slug      String   @unique @db.VarChar(256)
  title     String   @db.VarChar(256)
  content   String   @db.Text
  
  // 关系字段
  userId    Int      @map("user_id")
  user      User     @relation(fields: [userId], references: [id])
  
  // 时间戳
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@map("articles")
}
```

### 数据库约定
- 表名: `snake_case` 复数形式
- 字段名: `snake_case`
- 主键: `id` (自增整数)
- 外键: `{table}_id`
- 时间戳: `created_at`, `updated_at`
- 软删除: `deleted_at`

### 迁移管理
- 使用 Prisma Migrate
- 迁移文件命名: 描述性名称
- 生产环境迁移需要审查
- 备份数据库后执行迁移

## 🔐 安全规范

### 认证和授权
```typescript
@UseGuards(JwtAuthGuard)
@Controller('articles')
export class ArticlesController {
  @Roles('admin', 'user')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createDto: CreateArticleDto) {}
}
```

### 安全最佳实践
- 所有敏感接口需要认证
- 使用角色和权限控制
- 输入数据验证和清理
- SQL 注入防护 (Prisma 自动防护)
- 敏感信息不记录日志

### 环境变量
```env
# 数据库
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Clerk
CLERK_SECRET_KEY="sk_..."
```

## 🔧 错误处理规范

### 异常过滤器
```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const status = exception.getStatus()

    response.status(status).json({
      success: false,
      error: {
        code: exception.name,
        message: exception.message,
        timestamp: new Date().toISOString(),
      },
    })
  }
}
```

### 错误类型
- `BadRequestException`: 400 错误
- `UnauthorizedException`: 401 错误
- `ForbiddenException`: 403 错误
- `NotFoundException`: 404 错误
- `ConflictException`: 409 错误
- `InternalServerErrorException`: 500 错误

## 📊 日志规范

### 日志级别
- `error`: 错误信息
- `warn`: 警告信息
- `info`: 一般信息
- `debug`: 调试信息

### 日志内容
```typescript
this.logger.log('User created successfully', {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
})
```

### 日志规则
- 不记录敏感信息 (密码、token)
- 结构化日志格式
- 包含请求 ID 用于追踪
- 生产环境只记录 error 和 warn

## 🧪 测试规范

### 测试分类
- **单元测试**: 服务和工具函数
- **集成测试**: 控制器和数据库
- **E2E测试**: 完整业务流程

### 测试文件结构
```typescript
describe('ArticlesService', () => {
  let service: ArticlesService
  let prisma: PrismaService

  beforeEach(async () => {
    // 测试设置
  })

  describe('create', () => {
    it('should create an article', async () => {
      // 测试用例
    })
  })
})
```

### 测试覆盖率
- 服务层测试覆盖率 >= 90%
- 控制器测试覆盖率 >= 80%
- 工具函数测试覆盖率 >= 95%

## 🚀 性能优化规范

### 数据库优化
- 合理使用索引
- 避免 N+1 查询
- 使用 Prisma 的 `include` 和 `select`
- 分页查询大数据集

### 缓存策略
- Redis 缓存热点数据
- 数据库查询结果缓存
- 接口响应缓存
- 缓存失效策略

### 异步处理
- 使用队列处理耗时任务
- 异步发送邮件和通知
- 批量处理数据操作

## 📦 依赖管理规范

### 包管理
- 统一使用 `pnpm`
- 锁定依赖版本
- 定期更新安全补丁
- 审查新增依赖

### 依赖分类
- `dependencies`: 生产环境依赖
- `devDependencies`: 开发环境依赖
- `peerDependencies`: 对等依赖

## 🔄 开发流程规范

### Git 提交
- 使用 Conventional Commits
- 提交前运行测试
- 代码格式化检查

### 代码审查
- 所有代码必须审查
- 关注安全性和性能
- 检查测试覆盖率

### 部署流程
- 数据库迁移
- 环境变量检查
- 健康检查接口
- 回滚机制

## 🔧 配置管理规范

### 配置文件
```typescript
@Injectable()
export class AppConfig {
  @IsString()
  @IsNotEmpty()
  databaseUrl: string

  @IsString()
  @IsNotEmpty()
  jwtSecret: string

  @IsNumber()
  @Min(1)
  @Max(65535)
  port: number
}
```

### 环境配置
- 开发环境: `.env.local`
- 测试环境: `.env.test`
- 生产环境: `.env.production.local`
- 配置验证和类型安全
