import { Module } from '@nestjs/common';
import { TagService } from './services/tag.service';
import { MessageService } from './services/message.service';
import { TagController } from './controllers/tag.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TagController],
  providers: [TagService, MessageService],
  exports: [TagService, MessageService],
})
export class CommonModule {}
