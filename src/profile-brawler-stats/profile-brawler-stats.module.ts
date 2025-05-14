import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { profileBrawlerStatProviders } from './profile-brawler-stat.providers';
import { ProfileBrawlerStatsService } from './profile-brawler-stats.service';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [DatabaseModule, ProfilesModule],
  providers: [...profileBrawlerStatProviders, ProfileBrawlerStatsService],
  exports: [...profileBrawlerStatProviders, ProfileBrawlerStatsService],
})
export class ProfileBrawlerStatsModule {}
