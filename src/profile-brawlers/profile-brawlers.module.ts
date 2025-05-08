import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { profileBrawlerProviders } from './profile-brawler.providers';
import { ProfileBrawlersService } from './profile-brawlers.service';
import { GearsModule } from '../gears/gears.module';

@Module({
  imports: [DatabaseModule, GearsModule],
  providers: [...profileBrawlerProviders, ProfileBrawlersService],
  exports: [...profileBrawlerProviders, ProfileBrawlersService],
})
export class ProfileBrawlersModule {}
