# 个人博客后端系统

一个基于 NestJS 的现代化个人博客后端系统，支持用户管理、文章管理、书籍管理和完整的认证授权功能。

## 🚀 特性

- **用户管理**: 完整的用户 CRUD，支持 Clerk 集成
- **文章系统**: Markdown 支持，标签分类，发布管理
- **书籍管理**: 阅读进度跟踪，评分系统
- **认证授权**: JWT + Clerk 集成，基于角色的权限控制
- **评论系统**: 文章评论功能
- **标签管理**: 文章和书籍标签系统
- **搜索过滤**: 高级搜索和分页支持

## 🛠 技术栈

- **框架**: NestJS
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT + Clerk
- **验证**: class-validator
- **语言**: TypeScript

## 📦 安装和配置

### 环境要求
- Node.js 18+
- PostgreSQL 14+
- pnpm

### 安装步骤

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env.development
# 编辑 .env.development 文件，配置数据库连接等

# 3. 生成 Prisma Client
pnpm prisma generate

# 4. 运行数据库迁移
pnpm prisma migrate dev

# 5. 启动开发服务器
pnpm run start:dev
```

### 环境变量配置

创建 `.env.development` 文件：

```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/blog_db"

# JWT 配置
JWT_SECRET="your-super-secret-jwt-key"

# 应用配置
PORT=3000
NODE_ENV=development
```

## 🏗 项目结构

```
src/
├── auth/                 # 认证模块
├── user/                 # 用户模块
├── articles/             # 文章模块
├── bookstack/            # 书籍模块
├── common/               # 通用模块
│   ├── controllers/      # 通用控制器
│   ├── services/         # 通用服务
│   ├── dto/             # 数据传输对象
│   ├── decorators/       # 装饰器
│   ├── filters/          # 异常过滤器
│   └── interceptors/     # 拦截器
├── prisma/              # Prisma 服务
├── types/               # 类型定义
└── config/              # 配置文件
```

## 📚 API 接口

### 认证接口 (/auth)
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/clerk-sync` - Clerk 用户同步
- `POST /auth/refresh` - 刷新 Token
- `GET /auth/profile` - 获取用户资料

### 用户接口 (/users)
- `GET /users` - 用户列表
- `GET /users/:id` - 用户详情
- `PATCH /users/:id` - 更新用户
- `GET /users/:id/stats` - 用户统计

### 文章接口 (/articles)
- `GET /articles` - 文章列表
- `POST /articles` - 创建文章
- `GET /articles/:id` - 文章详情
- `PATCH /articles/:id/publish` - 发布文章
- `GET /articles/popular` - 热门文章

### 书籍接口 (/bookstack)
- `GET /bookstack` - 书籍列表
- `POST /bookstack` - 添加书籍
- `PATCH /bookstack/:id/progress` - 更新进度
- `GET /bookstack/stats` - 阅读统计

## 🔒 安全特性

- JWT Token 认证
- 密码 bcrypt 加密
- 基于角色的权限控制
- 输入数据验证
- SQL 注入防护

## 🚀 运行和部署

### 开发环境
```bash
# 启动开发服务器
pnpm run start:dev

# 运行测试
pnpm run test

# 运行 E2E 测试
pnpm run test:e2e
```

### 生产环境
```bash
# 构建项目
pnpm run build

# 启动生产服务器
pnpm run start:prod
```

## 📖 文档

详细文档请查看 `docs/` 目录：

- [初始实现文档](./docs/01-initial-implementation.md) - 基础功能实现
- [认证和通用功能文档](./docs/02-auth-and-common-features.md) - 认证系统和通用功能
- [最终总结文档](./docs/03-final-summary.md) - 完整项目总结

## 🗄️ 数据库

### Prisma 命令

```bash
# 生成 Prisma Client
pnpm prisma generate

# 创建迁移
pnpm prisma migrate dev --name init

# 重置数据库
pnpm prisma migrate reset

# 查看数据库
pnpm prisma studio
```

### 数据库结构

- **users**: 用户信息
- **articles**: 文章内容
- **book_stacks**: 书籍信息
- **tags**: 文章标签
- **book_tags**: 书籍标签
- **messages**: 评论信息
- **sessions**: 用户会话

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**开发完成时间**: 2025-01-29
**版本**: v3.0.0
**状态**: 生产就绪
