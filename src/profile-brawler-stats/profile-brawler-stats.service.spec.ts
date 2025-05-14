import { Test, TestingModule } from '@nestjs/testing';
import { ProfileBrawlerStatsService } from './profile-brawler-stats.service';

describe('StatsService', () => {
  let service: ProfileBrawlerStatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileBrawlerStatsService],
    }).compile();

    service = module.get<ProfileBrawlerStatsService>(
      ProfileBrawlerStatsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
