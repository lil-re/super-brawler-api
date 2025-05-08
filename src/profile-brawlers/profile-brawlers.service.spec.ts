import { Test, TestingModule } from '@nestjs/testing';
import { ProfileBrawlersService } from './profile-brawlers.service';

describe('ProfileBrawlersService', () => {
  let service: ProfileBrawlersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileBrawlersService],
    }).compile();

    service = module.get<ProfileBrawlersService>(ProfileBrawlersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
