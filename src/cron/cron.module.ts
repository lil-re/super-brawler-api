import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ProfilesModule } from '../profiles/profiles.module';
import { BrawlStarsModule } from '../brawl-stars/brawl-stars.module';
import { CronService } from './cron.service';
import { CronProcessor } from './cron.processor';

@Module({
  imports: [
    ProfilesModule,
    BrawlStarsModule,
    BullModule.registerQueue({
      name: 'cron',
    }),
  ],
  providers: [CronService, CronProcessor],
})
export class CronModule {}
