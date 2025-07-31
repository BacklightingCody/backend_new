# 个人博客后端项目功能详细分析

## 当前已实现功能总览

### 1. 文章管理模块 (ArticlesModule) - 详细分析

#### 已实现功能
- ✅ 文章 CRUD 操作
- ✅ 发布/草稿状态管理
- ✅ 标签系统
- ✅ 分类管理
- ✅ 点赞和收藏功能
- ✅ 浏览次数统计
- ✅ 热门文章查询
- ✅ 最新文章查询
- ✅ 高级搜索和过滤
- ✅ SEO 友好的 slug 支持

#### API 接口详细参数

##### 1. 创建文章
```
POST /articles
Content-Type: application/json

Body (CreateArticleDto):
{
  "slug": "string (1-256字符, 必填)",
  "title": "string (1-256字符, 必填)",
  "summary": "string (可选)",
  "content": "string (必填, Markdown格式)",
  "html": "string (可选, HTML缓存)",
  "coverImage": "string (可选, 封面图URL)",
  "readTime": "number (可选, 阅读时间分钟数)",
  "category": "string (1-64字符, 必填)",
  "isPublished": "boolean (可选, 默认false)",
  "isDraft": "boolean (可选, 默认true)",
  "tags": "string[] (可选, 标签数组)",
  "userId": "number (必填, 作者ID)"
}

Response:
{
  "success": true,
  "data": Article,
  "message": "Article created successfully"
}
```

##### 2. 获取文章列表
```
GET /articles?page=1&limit=10&search=keyword&category=tech&tags=javascript,react&userId=1&isPublished=true&isDraft=false&author=username&tag=javascript&sortBy=createdAt&sortOrder=desc

Query Parameters (ArticleQueryDto):
- page: number (可选, 默认1)
- limit: number (可选, 默认10)
- search: string (可选, 搜索标题/摘要/内容)
- category: string (可选, 分类过滤)
- tags: string (可选, 逗号分隔的标签)
- userId: number (可选, 作者ID过滤)
- isPublished: boolean (可选, 发布状态过滤)
- isDraft: boolean (可选, 草稿状态过滤)
- author: string (可选, 作者名搜索)
- tag: string (可选, 单个标签过滤)
- sortBy: string (可选, 排序字段, 默认createdAt)
- sortOrder: 'asc'|'desc' (可选, 排序方向, 默认desc)

Response:
{
  "success": true,
  "data": {
    "data": Article[],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

##### 3. 获取文章详情
```
GET /articles/:id

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "slug": "my-article",
    "title": "文章标题",
    "summary": "文章摘要",
    "content": "Markdown内容",
    "html": "HTML内容",
    "coverImage": "封面图URL",
    "readTime": 5,
    "category": "技术",
    "isPublished": true,
    "isDraft": false,
    "viewCount": 100,
    "likes": 10,
    "bookmarks": 5,
    "createdAt": "2025-01-29T00:00:00.000Z",
    "updatedAt": "2025-01-29T00:00:00.000Z",
    "user": {
      "id": 1,
      "username": "author",
      "firstName": "First",
      "lastName": "Last",
      "imageUrl": "头像URL"
    },
    "articleTags": [
      {
        "tag": {
          "id": 1,
          "name": "JavaScript",
          "color": "#f7df1e"
        }
      }
    ],
    "messages": [评论列表],
    "_count": {
      "messages": 5
    }
  }
}
```

##### 4. 通过 slug 获取文章
```
GET /articles/slug/:slug

功能: 
- 获取文章详情
- 自动增加浏览次数
- 返回完整的文章信息包括评论
```

##### 5. 更新文章
```
PATCH /articles/:id
Content-Type: application/json

Body (UpdateArticleDto): 
{
  // 所有字段都是可选的，只更新提供的字段
  "title": "string (可选)",
  "content": "string (可选)",
  "tags": "string[] (可选)",
  // ... 其他字段
}
```

##### 6. 发布/取消发布文章
```
PATCH /articles/:id/publish
PATCH /articles/:id/unpublish

功能:
- 发布: isPublished=true, isDraft=false
- 取消发布: isPublished=false, isDraft=true
```

##### 7. 点赞和收藏
```
PATCH /articles/:id/like
PATCH /articles/:id/bookmark

功能: 增加点赞数或收藏数
```

##### 8. 获取分类列表
```
GET /articles/categories

Response:
{
  "success": true,
  "data": ["技术", "生活", "随笔"]
}
```

##### 9. 获取热门文章
```
GET /articles/popular?limit=10

排序规则: 按点赞数、浏览数、收藏数排序
```

##### 10. 获取最新文章
```
GET /articles/recent?limit=10

排序规则: 按创建时间倒序
```

### 2. 书籍管理模块 (BookstackModule) - 详细分析

#### 已实现功能
- ✅ 书籍 CRUD 操作
- ✅ 阅读进度管理 (0-100%)
- ✅ 评分系统 (0-10分)
- ✅ 书籍标签系统
- ✅ 阅读统计
- ✅ 当前阅读、已完成书籍查询

#### API 接口详细参数

##### 1. 添加书籍
```
POST /bookstack
Content-Type: application/json

Body (CreateBookDto):
{
  "title": "string (必填, 书名)",
  "author": "string (必填, 作者)",
  "isbn": "string (可选, ISBN)",
  "publisher": "string (可选, 出版社)",
  "publishedYear": "number (可选, 出版年份)",
  "pages": "number (可选, 页数)",
  "language": "string (可选, 语言)",
  "description": "string (可选, 描述)",
  "coverImage": "string (可选, 封面图)",
  "progress": "number (可选, 0-100, 默认0)",
  "rating": "number (可选, 0-10)",
  "status": "READING|COMPLETED|WANT_TO_READ (可选)",
  "tags": "string[] (可选, 标签数组)",
  "userId": "number (必填, 用户ID)"
}
```

##### 2. 获取书籍列表
```
GET /bookstack?page=1&limit=10&search=keyword&status=READING&minRating=8

Query Parameters:
- page: number (可选, 默认1)
- limit: number (可选, 默认10)
- search: string (可选, 搜索书名/作者)
- status: 'READING'|'COMPLETED'|'WANT_TO_READ' (可选)
- minRating: number (可选, 最低评分)
- maxRating: number (可选, 最高评分)
- language: string (可选, 语言过滤)
- tags: string (可选, 标签过滤)
```

##### 3. 更新阅读进度
```
PATCH /bookstack/:id/progress
Content-Type: application/json

Body:
{
  "progress": "number (0-100, 必填)"
}

功能: 
- 更新阅读进度
- 当进度达到100%时自动设置状态为COMPLETED
```

##### 4. 更新书籍评分
```
PATCH /bookstack/:id/rating
Content-Type: application/json

Body:
{
  "rating": "number (0-10, 必填)"
}
```

##### 5. 获取阅读统计
```
GET /bookstack/stats

Response:
{
  "success": true,
  "data": {
    "totalBooks": 50,
    "completedBooks": 30,
    "currentlyReading": 5,
    "wantToRead": 15,
    "averageRating": 7.5,
    "totalPages": 15000,
    "completedPages": 9000
  }
}
```

##### 6. 获取已完成书籍
```
GET /bookstack/completed?limit=10

功能: 获取状态为COMPLETED的书籍列表
```

### 3. 用户管理模块 (UserModule) - 详细分析

#### 已实现功能
- ✅ 用户 CRUD 操作
- ✅ 用户状态管理
- ✅ 用户统计信息
- ✅ Clerk 用户同步

#### API 接口详细参数

##### 1. 获取用户列表
```
GET /users?page=1&limit=10&search=username&status=ACTIVE&role=USER

Query Parameters:
- page: number (可选, 默认1)
- limit: number (可选, 默认10)
- search: string (可选, 搜索用户名/邮箱)
- status: 'ACTIVE'|'BANNED'|'PENDING' (可选)
- role: 'USER'|'ADMIN' (可选)
```

##### 2. 获取用户统计
```
GET /users/:id/stats

Response:
{
  "success": true,
  "data": {
    "articlesCount": 25,
    "publishedArticlesCount": 20,
    "draftArticlesCount": 5,
    "totalViews": 10000,
    "totalLikes": 500,
    "booksCount": 30,
    "completedBooksCount": 20
  }
}
```

### 4. 认证模块 (AuthModule) - 详细分析

#### 已实现功能
- ✅ JWT Token 认证
- ✅ 用户注册和登录
- ✅ Clerk 用户同步
- ✅ Token 刷新机制

#### API 接口详细参数

##### 1. 用户注册
```
POST /auth/register
Content-Type: application/json

Body:
{
  "username": "string (必填)",
  "email": "string (必填, 邮箱格式)",
  "password": "string (必填, 最少6位)",
  "firstName": "string (可选)",
  "lastName": "string (可选)"
}
```

##### 2. 用户登录
```
POST /auth/login
Content-Type: application/json

Body:
{
  "email": "string (必填)",
  "password": "string (必填)"
}

Response:
{
  "success": true,
  "data": {
    "user": User,
    "accessToken": "JWT Token",
    "refreshToken": "Refresh Token"
  }
}
```

## 功能遗漏分析

### Articles 模块遗漏功能

#### 1. 前端展示相关
- ❌ **文章目录生成** - 从 Markdown 自动生成目录
- ❌ **相关文章推荐** - 基于标签或分类的相关文章
- ❌ **文章系列管理** - 文章系列/专栏功能
- ❌ **文章模板** - 预定义的文章模板
- ❌ **文章导出** - 导出为 PDF/Word 等格式

#### 2. 内容管理相关
- ❌ **文章版本控制** - 保存文章的历史版本
- ❌ **定时发布** - 设置文章的发布时间
- ❌ **文章置顶** - 置顶重要文章
- ❌ **文章归档** - 按时间归档文章
- ❌ **批量操作** - 批量发布/删除/修改状态

#### 3. 互动功能相关
- ❌ **评论回复** - 评论的嵌套回复功能
- ❌ **评论点赞** - 对评论进行点赞
- ❌ **用户收藏夹** - 用户个人收藏文章管理
- ❌ **阅读历史** - 记录用户阅读历史
- ❌ **分享功能** - 社交媒体分享

#### 4. SEO 和性能相关
- ❌ **sitemap 生成** - 自动生成网站地图
- ❌ **RSS 订阅** - 生成 RSS feed
- ❌ **文章缓存** - Redis 缓存热门文章
- ❌ **图片优化** - 图片压缩和 CDN 支持

### Bookstack 模块遗漏功能

#### 1. 阅读体验相关
- ❌ **阅读笔记** - 记录读书笔记和想法
- ❌ **书签功能** - 在书中添加书签
- ❌ **阅读时长统计** - 记录每天的阅读时长
- ❌ **阅读目标** - 设置年度/月度阅读目标
- ❌ **阅读计划** - 制定阅读计划和提醒

#### 2. 数据分析相关
- ❌ **阅读报告** - 生成详细的阅读分析报告
- ❌ **阅读趋势** - 阅读习惯和趋势分析
- ❌ **书籍推荐** - 基于阅读历史的推荐算法
- ❌ **阅读排行榜** - 按评分/热度排序

#### 3. 社交功能相关
- ❌ **书评系统** - 详细的书评和评论
- ❌ **读书分享** - 分享读书心得
- ❌ **书单功能** - 创建和分享书单
- ❌ **好友阅读** - 查看好友的阅读动态

#### 4. 数据管理相关
- ❌ **书籍导入** - 从豆瓣/Goodreads 导入书籍
- ❌ **数据导出** - 导出阅读数据
- ❌ **书籍搜索** - 集成第三方 API 搜索书籍信息
- ❌ **重复检测** - 检测重复添加的书籍

## 建议的功能优先级

### 高优先级 (立即实现)
1. **文章目录生成** - 提升阅读体验
2. **相关文章推荐** - 增加页面停留时间
3. **阅读笔记功能** - 核心阅读体验
4. **文章置顶** - 内容管理需求

### 中优先级 (短期实现)
1. **评论回复系统** - 完善互动功能
2. **用户收藏夹** - 用户体验提升
3. **阅读时长统计** - 数据分析基础
4. **RSS 订阅** - SEO 和用户留存

### 低优先级 (长期规划)
1. **文章版本控制** - 高级内容管理
2. **社交功能** - 社区建设
3. **第三方集成** - 数据丰富化
4. **高级分析** - 商业智能

## 接口设计建议

### 需要新增的核心接口

#### Articles 相关
```typescript
// 获取文章目录
GET /articles/:id/toc

// 获取相关文章
GET /articles/:id/related

// 文章置顶/取消置顶
PATCH /articles/:id/pin
PATCH /articles/:id/unpin

// 用户收藏/取消收藏
POST /articles/:id/favorite
DELETE /articles/:id/favorite
```

#### Bookstack 相关
```typescript
// 添加阅读笔记
POST /bookstack/:id/notes
GET /bookstack/:id/notes

// 更新阅读时长
PATCH /bookstack/:id/reading-time

// 设置阅读目标
POST /bookstack/goals
GET /bookstack/goals
```

---

**分析完成时间**: 2025-01-29
**建议实施**: 按优先级逐步实现遗漏功能