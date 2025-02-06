import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ProfilesModule } from '../profiles/profiles.module';
import { BattlesModule } from '../battles/battles.module';
import { StatsModule } from '../stats/stats.module';

@Module({
  imports: [ProfilesModule, BattlesModule, StatsModule],
  providers: [CronService],
})
export class CronModule {}
