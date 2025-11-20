import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { ArticleImportService } from './article-import.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { DocsController } from './docs.controller';
import { HealthController } from './health.controller';
import { CommentsController } from './comments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MessageService } from '../common/services/message.service';

@Module({
  imports: [PrismaModule],
  controllers: [ArticlesController, CategoriesController, DocsController, HealthController, CommentsController],
  providers: [ArticlesService, ArticleImportService, CategoriesService, MessageService],
  exports: [ArticlesService, ArticleImportService, CategoriesService, MessageService],
})
export class ArticlesModule {}
