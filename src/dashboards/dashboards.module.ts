import { Module } from '@nestjs/common';
import { DashboardsController } from './dashboards.controller';
import { DatabaseModule } from '../database/database.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { BattlesModule } from '../battles/battles.module';
import { StatsModule } from '../stats/stats.module';
import { DashboardsService } from './dashboards.service';
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
  providers: [DashboardsService],
})
export class DashboardsModule {}
