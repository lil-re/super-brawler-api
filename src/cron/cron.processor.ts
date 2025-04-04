import { Processor, WorkerHost } from '@nestjs/bullmq';
import { BrawlStarsService } from '../brawlstars/brawlStars.service';
import { Job } from 'bullmq';

@Processor('cron')
export class CronProcessor extends WorkerHost {
  constructor(private readonly brawlStarsService: BrawlStarsService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { profile } = job.data;

    switch (job.name) {
      case 'add-stats': {
        await this.brawlStarsService.handleProfileStats(profile);
        break;
      }
      case 'add-battles': {
        await this.brawlStarsService.handleProfileBattles(profile);
        break;
      }
    }
  }
}
