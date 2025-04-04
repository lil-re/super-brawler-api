import { Module } from '@nestjs/common';
import { BrawlStarsService } from './brawlStars.service';
import { BattlesModule } from '../battles/battles.module';
import { StatsModule } from '../stats/stats.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [ProfilesModule, BattlesModule, StatsModule],
  providers: [BrawlStarsService],
  exports: [BrawlStarsService],
})
export class BrawlStarsModule {}
