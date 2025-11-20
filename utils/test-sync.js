#!/usr/bin/env node

/**
 * 文章同步功能测试脚本
 * 用于验证 sync-articles.js 的各项功能
 */

const { ArticleSyncService } = require('./sync-articles');
const { PrismaClient } = require('@prisma/client');

class ArticleSyncTester {
  constructor() {
    this.prisma = new PrismaClient();
    this.syncService = new ArticleSyncService();
  }

  /**
   * 测试内容哈希计算
   */
  testContentHash() {
    console.log('🧪 测试内容哈希计算...');

    const article1 = {
      title: 'Test Article',
      slug: 'test-article',
      summary: 'Test summary',
      content: 'Test content'
    };

    const article2 = {
      title: 'Test Article',
      slug: 'test-article', 
      summary: 'Test summary',
      content: 'Test content'
    };

    const article3 = {
      title: 'Test Article Modified',
      slug: 'test-article',
      summary: 'Test summary',
      content: 'Test content'
    };

    const hash1 = this.syncService.calculateContentHash(article1);
    const hash2 = this.syncService.calculateContentHash(article2);
    const hash3 = this.syncService.calculateContentHash(article3);

    console.log(`  Hash1: ${hash1}`);
    console.log(`  Hash2: ${hash2}`);
    console.log(`  Hash3: ${hash3}`);

    if (hash1 === hash2) {
      console.log('  ✅ 相同内容生成相同哈希');
    } else {
      console.log('  ❌ 相同内容应该生成相同哈希');
    }

    if (hash1 !== hash3) {
      console.log('  ✅ 不同内容生成不同哈希');
    } else {
      console.log('  ❌ 不同内容应该生成不同哈希');
    }

    console.log('');
  }

  /**
   * 测试数据验证
   */
  testValidation() {
    console.log('🧪 测试数据验证...');

    const validArticle = {
      slug: 'valid-article',
      title: 'Valid Article',
      content: 'Valid content'
    };

    const invalidArticles = [
      { title: 'Missing slug', content: 'Content' },
      { slug: 'missing-title', content: 'Content' },
      { slug: 'missing-content', title: 'Missing Content' },
      { slug: 'a'.repeat(300), title: 'Too long slug', content: 'Content' },
      { slug: 'valid-slug', title: 'b'.repeat(300), content: 'Content' }
    ];

    // 测试有效文章
    const validResult = this.syncService.validateArticle(validArticle);
    if (validResult === null) {
      console.log('  ✅ 有效文章验证通过');
    } else {
      console.log(`  ❌ 有效文章验证失败: ${validResult}`);
    }

    // 测试无效文章
    invalidArticles.forEach((article, index) => {
      const result = this.syncService.validateArticle(article);
      if (result !== null) {
        console.log(`  ✅ 无效文章${index + 1}正确被拒绝: ${result}`);
      } else {
        console.log(`  ❌ 无效文章${index + 1}应该被拒绝`);
      }
    });

    console.log('');
  }

  /**
   * 测试数据库连接
   */
  async testDatabaseConnection() {
    console.log('🧪 测试数据库连接...');

    try {
      await this.prisma.$connect();
      console.log('  ✅ 数据库连接成功');

      // 测试查询
      const count = await this.prisma.article.count();
      console.log(`  📊 当前数据库中有 ${count} 篇文章`);

    } catch (error) {
      console.log(`  ❌ 数据库连接失败: ${error.message}`);
    }

    console.log('');
  }

  /**
   * 测试JSON文件读取
   */
  async testJsonReading() {
    console.log('🧪 测试JSON文件读取...');

    try {
      const { articles, fileSources } = await this.syncService.readJsonFiles();
      console.log(`  ✅ 成功读取 ${articles.length} 篇文章`);
      
      if (articles.length > 0) {
        const firstArticle = articles[0];
        console.log(`  📄 示例文章: ${firstArticle.title}`);
        console.log(`  🔗 Slug: ${firstArticle.slug}`);
        console.log(`  🔢 内容哈希: ${firstArticle.contentHash}`);
      }

    } catch (error) {
      console.log(`  ❌ 读取JSON文件失败: ${error.message}`);
    }

    console.log('');
  }

  /**
   * 生成测试报告
   */
  async generateTestReport() {
    console.log('📋 生成测试报告...');

    try {
      // 获取数据库统计
      const totalArticles = await this.prisma.article.count();
      const publishedArticles = await this.prisma.article.count({
        where: { isPublished: true }
      });
      const draftArticles = await this.prisma.article.count({
        where: { isDraft: true }
      });

      // 获取JSON文件统计
      const { articles: jsonArticles } = await this.syncService.readJsonFiles();

      console.log('');
      console.log('=' .repeat(50));
      console.log('📊 测试环境报告');
      console.log('='.repeat(50));
      console.log(`📄 JSON文件中的文章: ${jsonArticles.length}`);
      console.log(`🗄️  数据库中的文章: ${totalArticles}`);
      console.log(`📢 已发布文章: ${publishedArticles}`);
      console.log(`📝 草稿文章: ${draftArticles}`);
      console.log('='.repeat(50));

    } catch (error) {
      console.log(`❌ 生成报告失败: ${error.message}`);
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🧪 开始运行文章同步功能测试...\n');

    try {
      // 1. 测试内容哈希
      this.testContentHash();

      // 2. 测试数据验证
      this.testValidation();

      // 3. 测试数据库连接
      await this.testDatabaseConnection();

      // 4. 测试JSON文件读取
      await this.testJsonReading();

      // 5. 生成测试报告
      await this.generateTestReport();

      console.log('\n🎉 所有测试完成！');

    } catch (error) {
      console.error(`❌ 测试过程中发生错误: ${error.message}`);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * 清理资源
   */
  async cleanup() {
    await this.prisma.$disconnect();
    await this.syncService.cleanup();
  }
}

// 主函数
async function main() {
  const tester = new ArticleSyncTester();
  
  // 处理进程退出
  process.on('SIGINT', async () => {
    console.log('\n\n⚠️  收到退出信号，正在清理资源...');
    await tester.cleanup();
    process.exit(0);
  });

  await tester.runAllTests();
}

// 执行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ArticleSyncTester };