import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImportDataDto, ImportUserDto, ImportTagDto, ImportArticleDto } from './dto/import-article.dto';

@Injectable()
export class ArticleImportService {
  private readonly logger = new Logger(ArticleImportService.name);

  constructor(private prisma: PrismaService) {}

  async importData(importData: ImportDataDto) {
    const results = {
      users: { created: 0, updated: 0, errors: [] as string[] },
      tags: { created: 0, updated: 0, errors: [] as string[] },
      articles: { created: 0, updated: 0, errors: [] as string[] },
    };

    try {
      // 导入用户
      this.logger.log('开始导入用户...');
      for (const userData of importData.users) {
        try {
          await this.importUser(userData);
          results.users.created++;
        } catch (error) {
          this.logger.error(`导入用户失败: ${userData.username}`, error.message);
          results.users.errors.push(`${userData.username}: ${error.message}`);
        }
      }

      // 导入标签
      this.logger.log('开始导入标签...');
      for (const tagData of importData.tags) {
        try {
          await this.importTag(tagData);
          results.tags.created++;
        } catch (error) {
          this.logger.error(`导入标签失败: ${tagData.name}`, error.message);
          results.tags.errors.push(`${tagData.name}: ${error.message}`);
        }
      }

      // 导入文章
      this.logger.log('开始导入文章...');
      for (const articleData of importData.articles) {
        try {
          await this.importArticle(articleData);
          results.articles.created++;
        } catch (error) {
          this.logger.error(`导入文章失败: ${articleData.title}`, error.message);
          results.articles.errors.push(`${articleData.title}: ${error.message}`);
        }
      }

      this.logger.log('数据导入完成', results);
      return results;
    } catch (error) {
      this.logger.error('数据导入过程中发生错误', error);
      throw new BadRequestException('数据导入失败');
    }
  }

  private async importUser(userData: ImportUserDto) {
    // 检查用户是否已存在（通过email查找，因为username不是unique）
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: `${userData.username}@example.com` },
          { username: userData.username }
        ]
      },
    });

    if (existingUser) {
      // 更新现有用户
      return await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          imageUrl: userData.imageUrl,
        },
      });
    } else {
      // 创建新用户
      return await this.prisma.user.create({
        data: {
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          imageUrl: userData.imageUrl,
          email: `${userData.username}@example.com`, // 临时邮箱
          clerkId: `temp_${userData.username}`, // 临时clerkId
        },
      });
    }
  }

  private async importTag(tagData: ImportTagDto) {
    // 检查标签是否已存在
    const existingTag = await this.prisma.tag.findUnique({
      where: { slug: tagData.slug },
    });

    if (existingTag) {
      // 更新现有标签
      return await this.prisma.tag.update({
        where: { slug: tagData.slug },
        data: {
          name: tagData.name,
          color: tagData.color,
          description: tagData.description,
        },
      });
    } else {
      // 创建新标签
      return await this.prisma.tag.create({
        data: {
          name: tagData.name,
          slug: tagData.slug,
          color: tagData.color,
          description: tagData.description,
        },
      });
    }
  }

  private async importArticle(articleData: ImportArticleDto) {
    // 检查文章是否已存在
    const existingArticle = await this.prisma.article.findUnique({
      where: { slug: articleData.slug },
    });

    // 获取用户ID
    const user = await this.prisma.user.findFirst({
      where: { id: articleData.userId },
    });

    if (!user) {
      throw new Error(`用户ID ${articleData.userId} 不存在`);
    }

    // 获取标签ID
    const tagIds: number[] = [];
    for (const articleTag of articleData.articleTags) {
      const tag = await this.prisma.tag.findFirst({
        where: { id: articleTag.tagId },
      });
      if (tag) {
        tagIds.push(tag.id);
      }
    }

    const articleDataForDb = {
      slug: articleData.slug,
      title: articleData.title,
      summary: articleData.summary,
      content: articleData.content,
      html: articleData.html,
      coverImage: articleData.coverImage,
      readTime: articleData.readTime,
      category: articleData.category,
      isPublished: articleData.isPublished ?? true,
      isDraft: articleData.isDraft ?? false,
      viewCount: articleData.viewCount ?? 0,
      likes: articleData.likes ?? 0,
      bookmarks: articleData.bookmarks ?? 0,
      comments: articleData.comments ?? 0,
      userId: user.id,
      createdAt: new Date(articleData.createdAt),
      updatedAt: new Date(articleData.updatedAt),
    };

    if (existingArticle) {
      // 更新现有文章
      const updatedArticle = await this.prisma.article.update({
        where: { slug: articleData.slug },
        data: articleDataForDb,
      });

      // 更新文章标签关联
      await this.prisma.articleTag.deleteMany({
        where: { articleId: updatedArticle.id },
      });

      for (const tagId of tagIds) {
        await this.prisma.articleTag.create({
          data: {
            articleId: updatedArticle.id,
            tagId: tagId,
          },
        });
      }

      return updatedArticle;
    } else {
      // 创建新文章
      const newArticle = await this.prisma.article.create({
        data: articleDataForDb,
      });

      // 创建文章标签关联
      for (const tagId of tagIds) {
        await this.prisma.articleTag.create({
          data: {
            articleId: newArticle.id,
            tagId: tagId,
          },
        });
      }

      return newArticle;
    }
  }

  async clearAllData() {
    this.logger.log('开始清理所有数据...');
    
    try {
      // 删除关联数据
      await this.prisma.articleTag.deleteMany();
      await this.prisma.message.deleteMany();
      
      // 删除主要数据
      await this.prisma.article.deleteMany();
      await this.prisma.tag.deleteMany();
      await this.prisma.user.deleteMany();
      
      this.logger.log('数据清理完成');
      return { success: true, message: '所有数据已清理' };
    } catch (error) {
      this.logger.error('数据清理失败', error);
      throw new BadRequestException('数据清理失败');
    }
  }
}
