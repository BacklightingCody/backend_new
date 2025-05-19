import { Test, TestingModule } from '@nestjs/testing';
import { BookstackController } from './bookstack.controller';

describe('BookstackController', () => {
  let controller: BookstackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookstackController],
    }).compile();

    controller = module.get<BookstackController>(BookstackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
