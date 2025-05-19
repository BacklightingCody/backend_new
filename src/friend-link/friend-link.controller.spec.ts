import { Test, TestingModule } from '@nestjs/testing';
import { FriendLinkController } from './friend-link.controller';

describe('FriendLinkController', () => {
  let controller: FriendLinkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendLinkController],
    }).compile();

    controller = module.get<FriendLinkController>(FriendLinkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
