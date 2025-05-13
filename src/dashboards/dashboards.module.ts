import { Module } from '@nestjs/common';
import { DashboardsController } from './dashboards.controller';
import { DatabaseModule } from '../database/database.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { BattlesModule } from '../battles/battles.module';
import { StatsModule } from '../stats/stats.module';
import { BattleLogService } from './services/battle-log.service';
import { ProfileStatsService } from './services/profile-stats.service';
import { BattlesStatsService } from './services/battles-stats.service';
import { BrawlersListService } from './services/brawlers-list.service';
import { BrawlersStatsService } from './services/brawlers-stats.service';
import { PlayersModule } from '../players/players.module';
import { ProfileBrawlersModule } from '../profile-brawlers/profile-brawlers.module';

@Module({
  imports: [
    DatabaseModule,
    ProfilesModule,
    BattlesModule,
    PlayersModule,
    ProfileBrawlersModule,
    StatsModule,
  ],
  controllers: [DashboardsController],
  providers: [
    BattleLogService,
    ProfileStatsService,
    BattlesStatsService,
    BrawlersListService,
    BrawlersStatsService,
  ],
})
export class DashboardsModule {}
