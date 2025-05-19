import { Module } from '@nestjs/common';
import { BookstackController } from './bookstack.controller';
import { BookstackService } from './bookstack.service';

@Module({
  controllers: [BookstackController],
  providers: [BookstackService]
})
export class BookstackModule {}
