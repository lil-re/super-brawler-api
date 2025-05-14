import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { statProviders } from './stat.providers';
import { StatsService } from './stats.service';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [DatabaseModule, ProfilesModule],
  providers: [...statProviders, StatsService],
  exports: [...statProviders, StatsService],
})
export class StatsModule {}
