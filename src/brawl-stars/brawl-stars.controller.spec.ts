import { Test, TestingModule } from '@nestjs/testing';
import { BrawlStarsController } from './brawl-stars.controller';
import { BrawlStarsService } from './brawl-stars.service';

describe('BrawlStarsController', () => {
  let controller: BrawlStarsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrawlStarsController],
      providers: [BrawlStarsService],
    }).compile();

    controller = module.get<BrawlStarsController>(BrawlStarsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
