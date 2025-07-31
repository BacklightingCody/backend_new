# 环境配置说明

## 环境文件结构

项目使用两个环境文件来管理不同环境的配置：

- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

## 可用的 npm 脚本

### Prisma 相关命令

#### 开发环境
```bash
# 生成 Prisma 客户端
npm run prisma:generate:dev

# 推送数据库结构
npm run prisma:push:dev

# 运行数据库迁移
npm run prisma:migrate:dev
```

#### 生产环境
```bash
# 生成 Prisma 客户端
npm run prisma:generate:prod

# 推送数据库结构
npm run prisma:push:prod

# 部署数据库迁移
npm run prisma:migrate:prod
```

#### 通用命令（使用默认环境）
```bash
# 生成 Prisma 客户端
npm run prisma:generate

# 推送数据库结构
npm run prisma:push

# 打开 Prisma Studio
npm run prisma:studio

# 重置数据库
npm run prisma:reset

# 运行种子数据
npm run db:seed
```

## 环境变量说明

### 开发环境 (.env.development)

```env
# 环境标识
NODE_ENV=development

# 数据库配置
DATABASE_URL="postgresql://postgres:123456@localhost:5432/blog_article?schema=public"

# JWT 配置
JWT_SECRET="dev-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# 应用配置
PORT=3000

# Clerk 配置（可选）
CLERK_SECRET_KEY=""
CLERK_PUBLISHABLE_KEY=""

# OpenAI 配置（可选）
OPENAI_API_KEY=""
OPENAI_BASE_URL=""

# CORS 配置
CORS_ORIGIN="http://localhost:3001,http://localhost:3000"

# 日志级别
LOG_LEVEL="debug"
```

### 生产环境 (.env.production)

```env
# 环境标识
NODE_ENV=production

# 数据库配置（需要替换为实际的生产数据库）
DATABASE_URL="postgresql://username:password@your-production-host:5432/blog_db"

# JWT 配置（需要使用强密钥）
JWT_SECRET="your-production-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# 应用配置
PORT=3000

# Clerk 配置（生产环境密钥）
CLERK_SECRET_KEY="your-production-clerk-secret"
CLERK_PUBLISHABLE_KEY="your-production-clerk-publishable-key"

# OpenAI 配置（生产环境密钥）
OPENAI_API_KEY="your-production-openai-key"
OPENAI_BASE_URL="https://api.openai.com/v1"

# CORS 配置（生产域名）
CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"

# 日志级别
LOG_LEVEL="info"
```

## 使用方法

### 开发环境启动
```bash
# 使用开发环境配置启动
npm run start:dev

# 或者手动指定环境文件
NODE_ENV=development npm start
```

### 生产环境启动
```bash
# 使用生产环境配置启动
NODE_ENV=production npm run start:prod

# 或者手动指定环境文件
NODE_ENV=production npm start
```

## 数据库配置

### 开发环境数据库
- 数据库名：`blog_article`
- 用户名：`postgres`
- 密码：`123456`
- 主机：`localhost`
- 端口：`5432`

### 生产环境数据库
需要根据实际的生产环境配置修改 `.env.production` 文件中的 `DATABASE_URL`。

## 安全注意事项

1. **永远不要提交包含敏感信息的环境文件到版本控制**
2. **生产环境必须使用强密钥**
3. **定期轮换 JWT 密钥和 API 密钥**
4. **确保数据库连接使用 SSL（生产环境）**

## 故障排除

### 环境文件未找到
如果遇到环境文件未找到的错误，请确保：
1. 文件名正确：`.env.development` 或 `.env.production`
2. 文件位置正确：在项目根目录下
3. 文件权限正确：可读权限

### 数据库连接失败
1. 检查 `DATABASE_URL` 格式是否正确
2. 确认数据库服务正在运行
3. 验证用户名、密码、数据库名是否正确
4. 检查网络连接和防火墙设置

### Prisma 相关错误
```bash
# 重新生成客户端
npm run prisma:generate:dev

# 重置数据库（谨慎使用）
npm run prisma:reset

# 查看数据库状态
npm run prisma:studio
```
