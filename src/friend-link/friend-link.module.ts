import { Module } from '@nestjs/common';
import { FriendLinkController } from './friend-link.controller';
import { FriendLinkService } from './friend-link.service';

@Module({
  controllers: [FriendLinkController],
  providers: [FriendLinkService]
})
export class FriendLinkModule {}
