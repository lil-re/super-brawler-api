import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { BattlesModule } from '../battles/battles.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [BattlesModule, ProfilesModule],
  providers: [CronService],
})
export class CronModule {}
