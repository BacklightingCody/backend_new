import { Module } from '@nestjs/common';
import { BookstackController } from './bookstack.controller';
import { BookstackService } from './bookstack.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookstackController],
  providers: [BookstackService],
  exports: [BookstackService],
})
export class BookstackModule {}
