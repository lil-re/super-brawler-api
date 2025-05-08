import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class CronService {
  constructor(
    private profilesService: ProfilesService,

    @InjectQueue('cron') private cronQueue: Queue,
  ) {}

  @Cron('0 */1 * * * *')
  async profilesCron() {
    const profiles = await this.profilesService.findAllActive();

    for (const profile of profiles) {
      await this.cronQueue.add('add-stats', {
        profile,
      });
      await this.cronQueue.add('add-battles', {
        profile,
      });
    }
  }
}
