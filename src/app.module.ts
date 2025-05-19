import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ArticlesModule } from './articles/articles.module';
import { BookstackModule } from './bookstack/bookstack.module';
import { FriendLinkModule } from './friend-link/friend-link.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ArticlesModule,
    BookstackModule,
    FriendLinkModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
