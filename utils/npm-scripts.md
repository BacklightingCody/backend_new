# Package.json 脚本配置建议

将以下脚本添加到你的 `package.json` 文件中：

```json
{
  "scripts": {
    "sync:articles": "node utils/sync-articles.js",
    "sync:test": "node utils/test-sync.js",
    "sync:articles:verbose": "node utils/sync-articles.js 2>&1 | tee sync.log",
    "utils:help": "echo '可用工具脚本:' && echo '  npm run sync:articles - 同步文章到数据库' && echo '  npm run sync:test - 测试同步功能' && echo '  npm run sync:articles:verbose - 详细输出并保存日志'"
  }
}
```

## 使用方法

### 1. 同步文章
```bash
npm run sync:articles
```

### 2. 测试功能
```bash
npm run sync:test
```

### 3. 详细输出并保存日志
```bash
npm run sync:articles:verbose
```

### 4. 查看帮助
```bash
npm run utils:help
```

## 环境变量配置

确保你的 `.env` 文件包含正确的数据库配置：

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/blog_db?schema=public"

# 可选：同步配置
SYNC_BATCH_SIZE=50
SYNC_TIMEOUT=30000
```

## 注意事项

1. **权限确认**：确保脚本有读取 `json/` 目录的权限
2. **数据库访问**：确保数据库连接配置正确
3. **备份数据**：在生产环境执行前请备份数据库
4. **测试环境**：建议先在测试环境验证功能