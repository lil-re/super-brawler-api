import { Module } from '@nestjs/common';
import { BrawlStarsService } from './brawl-stars.service';
import { StatsModule } from '../stats/stats.module';
import { ProfileBrawlersModule } from '../profile-brawlers/profile-brawlers.module';
import { BattlesModule } from '../battles/battles.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { BrawlersModule } from '../brawlers/brawlers.module';
import { BrawlStarsController } from './brawl-stars.controller';

@Module({
  imports: [
    ProfilesModule,
    StatsModule,
    ProfileBrawlersModule,
    BattlesModule,
    BrawlersModule,
  ],
  controllers: [BrawlStarsController],
  providers: [BrawlStarsService],
  exports: [BrawlStarsService],
})
export class BrawlStarsModule {}
