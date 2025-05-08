import { Test, TestingModule } from '@nestjs/testing';
import { StarPowersService } from './star-powers.service';

describe('StarPowersService', () => {
  let service: StarPowersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StarPowersService],
    }).compile();

    service = module.get<StarPowersService>(StarPowersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
