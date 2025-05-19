import { Test, TestingModule } from '@nestjs/testing';
import { BookstackService } from './bookstack.service';

describe('BookstackService', () => {
  let service: BookstackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookstackService],
    }).compile();

    service = module.get<BookstackService>(BookstackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
