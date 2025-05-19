import { Test, TestingModule } from '@nestjs/testing';
import { FriendLinkService } from './friend-link.service';

describe('FriendLinkService', () => {
  let service: FriendLinkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FriendLinkService],
    }).compile();

    service = module.get<FriendLinkService>(FriendLinkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
