import { Test, TestingModule } from '@nestjs/testing';
import { BrawlStarsService } from './brawl-stars.service';

describe('BrawlstarsService', () => {
  let service: BrawlStarsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrawlStarsService],
    }).compile();

    service = module.get<BrawlStarsService>(BrawlStarsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
