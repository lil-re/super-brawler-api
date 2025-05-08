import { Module } from '@nestjs/common';
import { BrawlStarsService } from './brawl-stars.service';
import { BattlesModule } from '../battles/battles.module';
import { StatsModule } from '../stats/stats.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { BrawlersModule } from '../brawlers/brawlers.module';
import { BrawlStarsController } from './brawl-stars.controller';

@Module({
  imports: [ProfilesModule, BattlesModule, StatsModule, BrawlersModule],
  controllers: [BrawlStarsController],
  providers: [BrawlStarsService],
  exports: [BrawlStarsService],
})
export class BrawlStarsModule {}
