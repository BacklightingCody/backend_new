#!/usr/bin/env node

/**
 * 文章同步脚本
 * 功能：从本地 json/ 文件夹读取 JSON 文件，自动同步到 PostgreSQL 数据库
 * 支持：新增、修改、删除操作
 * 
 * 使用方法：
 * node utils/sync-articles.js
 * 
 * 环境要求：
 * - Node.js >= 18
 * - PostgreSQL 数据库
 * - .env 文件配置正确的 DATABASE_URL
 */
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

class ArticleSyncService {
  constructor() {
    this.prisma = new PrismaClient();
    this.jsonDir = path.join(__dirname, '../json');
    this.supportedFiles = ['.json'];
    this.defaultUserId = null; // 默认用户ID
    this.stats = {
      total: 0,
      created: 0,
      updated: 0,
      deleted: 0,
      skipped: 0,
      errors: 0
    };
  }

  /**
   * 确保默认用户存在
   */
  async ensureDefaultUser() {
    try {
      // 检查是否存在用户
      const userCount = await this.prisma.user.count();

      if (userCount === 0) {
        console.log('📝 创建默认用户...');

        // 创建默认用户
        const defaultUser = await this.prisma.user.create({
          data: {
            email: 'admin@blog.com',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            status: 'ACTIVE'
          }
        });

        console.log(`  ✅ 创建默认用户: ${defaultUser.email} (ID: ${defaultUser.id})`);
        return defaultUser.id;
      } else {
        // 获取第一个用户ID作为默认用户
        const firstUser = await this.prisma.user.findFirst({
          select: { id: true, email: true }
        });

        console.log(`📝 使用现有用户: ${firstUser.email} (ID: ${firstUser.id})`);
        return firstUser.id;
      }
    } catch (error) {
      console.error(`❌ 确保默认用户失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 计算内容哈希值
   * 基于 title, slug, summary, content 字段
   */
  calculateContentHash(article) {
    const contentString = `${article.title || ''}|${article.slug || ''}|${article.summary || ''}|${article.content || ''}|${article.tags || ''}|${article.description || ''}`;
    return crypto.createHash('md5').update(contentString, 'utf8').digest('hex');
  }

  /**
   * 读取所有JSON文件
   */
  async readJsonFiles() {
    try {
      const files = await fs.readdir(this.jsonDir);
      const jsonFiles = files.filter(file =>
        this.supportedFiles.includes(path.extname(file).toLowerCase())
      );

      console.log(`📁 发现 ${jsonFiles.length} 个JSON文件`);

      const allArticles = [];
      const fileSources = new Map(); // 记录文章来源文件

      for (const file of jsonFiles) {
        try {
          const filePath = path.join(this.jsonDir, file);
          const fileContent = await fs.readFile(filePath, 'utf8');
          const data = JSON.parse(fileContent);

          if (data.articles && Array.isArray(data.articles)) {
            data.articles.forEach(article => {
              // 为每篇文章添加内容哈希
              article.contentHash = this.calculateContentHash(article);
              allArticles.push(article);
              fileSources.set(article.slug, file);
            });
            console.log(`  ✅ ${file}: ${data.articles.length} 篇文章`);
          } else {
            console.log(`  ⚠️  ${file}: 格式不正确，跳过`);
          }
        } catch (error) {
          console.error(`  ❌ ${file}: 读取失败 - ${error.message}`);
          this.stats.errors++;
        }
      }

      console.log(`📊 总计发现 ${allArticles.length} 篇文章\n`);
      return { articles: allArticles, fileSources };
    } catch (error) {
      console.error(`❌ 读取JSON目录失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取数据库中的所有文章
   */
  async getDatabaseArticles() {
    try {
      const articles = await this.prisma.article.findMany({
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          content: true,
          coverImage: true,
          readTime: true,
          category: true,
          isPublished: true,
          isDraft: true,
          viewCount: true,
          likes: true,
          bookmarks: true,
          comments: true,
          userId: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // 为数据库文章计算内容哈希
      const articlesWithHash = articles.map(article => ({
        ...article,
        contentHash: this.calculateContentHash(article)
      }));

      console.log(`🗄️  数据库中现有 ${articlesWithHash.length} 篇文章\n`);
      return articlesWithHash;
    } catch (error) {
      console.error(`❌ 查询数据库失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 验证文章数据
   */
  validateArticle(article) {
    const required = ['slug', 'title', 'content'];
    const missing = required.filter(field => !article[field]);

    if (missing.length > 0) {
      return `缺少必需字段: ${missing.join(', ')}`;
    }

    if (typeof article.slug !== 'string' || article.slug.length > 256) {
      return 'slug 必须是字符串且长度不超过 256';
    }

    if (typeof article.title !== 'string' || article.title.length > 256) {
      return 'title 必须是字符串且长度不超过 256';
    }

    if (typeof article.content !== 'string') {
      return 'content 必须是字符串';
    }

    return null;
  }

  /**
   * 创建新文章
   */
  async createArticle(article) {
    try {
      const validation = this.validateArticle(article);
      if (validation) {
        throw new Error(`数据验证失败: ${validation}`);
      }

      const articleData = {
        slug: article.slug,
        title: article.title,
        summary: article.summary || null,
        content: article.content,
        html: null, // 可以后续添加 Markdown 转 HTML 的逻辑
        coverImage: article.coverImage || null,
        readTime: article.readTime || null,
        category: article.category || 'uncategorized',
        isPublished: article.isPublished !== undefined ? article.isPublished : false,
        isDraft: article.isDraft !== undefined ? article.isDraft : true,
        viewCount: article.viewCount || 0,
        likes: article.likes || 0,
        bookmarks: article.bookmarks || 0,
        comments: article.comments || 0,
        userId: article.userId || this.defaultUserId, // 使用动态获取的默认用户ID
        description: article.description || null,
        tags: article.tags || []
      };

      const created = await this.prisma.article.create({
        data: articleData
      });

      console.log(`  ✅ 创建: ${article.slug}`);
      this.stats.created++;
      return created;
    } catch (error) {
      console.error(`  ❌ 创建失败 [${article.slug}]: ${error.message}`);
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * 更新文章
   */
  async updateArticle(existingArticle, newArticle) {
    try {
      const validation = this.validateArticle(newArticle);
      if (validation) {
        throw new Error(`数据验证失败: ${validation}`);
      }

      const updateData = {
        title: newArticle.title,
        summary: newArticle.summary || null,
        content: newArticle.content,
        coverImage: newArticle.coverImage || null,
        readTime: newArticle.readTime || null,
        category: newArticle.category || existingArticle.category,
        isPublished: newArticle.isPublished !== undefined ? newArticle.isPublished : existingArticle.isPublished,
        isDraft: newArticle.isDraft !== undefined ? newArticle.isDraft : existingArticle.isDraft,
        // 保持现有的统计数据
        viewCount: existingArticle.viewCount,
        likes: existingArticle.likes,
        bookmarks: existingArticle.bookmarks,
        comments: existingArticle.comments,
        userId: existingArticle.userId,
        updatedAt: new Date()
      };

      const updated = await this.prisma.article.update({
        where: { id: existingArticle.id },
        data: updateData
      });

      console.log(`  🔄 更新: ${newArticle.slug}`);
      this.stats.updated++;
      return updated;
    } catch (error) {
      console.error(`  ❌ 更新失败 [${newArticle.slug}]: ${error.message}`);
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * 软删除文章（标记为删除）
   */
  async deleteArticle(article) {
    try {
      // 使用软删除：将文章标记为草稿并设为未发布
      const deleted = await this.prisma.article.update({
        where: { id: article.id },
        data: {
          isPublished: false,
          isDraft: true,
          updatedAt: new Date()
        }
      });

      console.log(`  🗑️  软删除: ${article.slug}`);
      this.stats.deleted++;
      return deleted;
    } catch (error) {
      console.error(`  ❌ 删除失败 [${article.slug}]: ${error.message}`);
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * 同步文章
   */
  async syncArticles() {
    try {
      console.log('🚀 开始同步文章...\n');

      // 0. 确保默认用户存在
      this.defaultUserId = await this.ensureDefaultUser();
      console.log('');

      // 1. 读取JSON文件
      const { articles: jsonArticles, fileSources } = await this.readJsonFiles();
      this.stats.total = jsonArticles.length;

      // 2. 获取数据库文章
      const dbArticles = await this.getDatabaseArticles();

      // 3. 创建映射表
      const jsonArticleMap = new Map();
      jsonArticles.forEach(article => {
        jsonArticleMap.set(article.slug, article);
      });

      const dbArticleMap = new Map();
      dbArticles.forEach(article => {
        dbArticleMap.set(article.slug, article);
      });

      console.log('📝 开始处理文章...\n');

      // 4. 处理新增和更新
      for (const jsonArticle of jsonArticles) {
        try {
          const existingArticle = dbArticleMap.get(jsonArticle.slug);

          if (!existingArticle) {
            // 新增文章
            await this.createArticle(jsonArticle);
          } else {
            // 检查内容是否有变化
            if (existingArticle.contentHash !== jsonArticle.contentHash) {
              await this.updateArticle(existingArticle, jsonArticle);
            } else {
              console.log(`  ⏭️  跳过: ${jsonArticle.slug} (无变化)`);
              this.stats.skipped++;
            }
          }
        } catch (error) {
          // 错误已在各个方法中处理，这里只是继续执行
        }
      }

      // 5. 处理删除（文件中不存在但数据库中存在的文章）
      for (const dbArticle of dbArticles) {
        if (!jsonArticleMap.has(dbArticle.slug) && dbArticle.isPublished) {
          try {
            await this.deleteArticle(dbArticle);
          } catch (error) {
            // 错误已在方法中处理
          }
        }
      }

    } catch (error) {
      console.error(`❌ 同步过程发生错误: ${error.message}`);
      this.stats.errors++;
    }
  }

  /**
   * 打印同步统计
   */
  printStats() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 同步统计报告');
    console.log('='.repeat(50));
    console.log(`📄 总文章数:   ${this.stats.total}`);
    console.log(`✅ 新增:       ${this.stats.created}`);
    console.log(`🔄 更新:       ${this.stats.updated}`);
    console.log(`🗑️  删除:       ${this.stats.deleted}`);
    console.log(`⏭️  跳过:       ${this.stats.skipped}`);
    console.log(`❌ 错误:       ${this.stats.errors}`);
    console.log('='.repeat(50));

    if (this.stats.errors === 0) {
      console.log('🎉 同步完成，无错误！');
    } else {
      console.log(`⚠️  同步完成，但有 ${this.stats.errors} 个错误`);
    }
  }

  /**
   * 清理资源
   */
  async cleanup() {
    await this.prisma.$disconnect();
  }

  /**
   * 执行同步
   */
  async run() {
    try {
      await this.syncArticles();
    } catch (error) {
      console.error('❌ 同步失败:', error.message);
      process.exit(1);
    } finally {
      this.printStats();
      await this.cleanup();
    }
  }
}

// 主函数
async function main() {
  const syncService = new ArticleSyncService();

  // 处理进程退出
  process.on('SIGINT', async () => {
    console.log('\n\n⚠️  收到退出信号，正在清理资源...');
    await syncService.cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n⚠️  收到终止信号，正在清理资源...');
    await syncService.cleanup();
    process.exit(0);
  });

  await syncService.run();
}

// 执行脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ArticleSyncService };
