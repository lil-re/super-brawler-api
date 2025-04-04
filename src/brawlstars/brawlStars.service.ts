import ky from 'ky';
import * as process from 'node:process';
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BattlesService } from '../battles/battles.service';
import { StatsService } from '../stats/stats.service';
import { Profile } from '../profiles/profile.entity';
import { CreateBattleDto } from '../battles/dto/create-battle.dto';
import { CreateStatDto } from '../stats/dto/create-stat.dto';

@Injectable()
export class BrawlStarsService {
  private readonly logger = new Logger(BattlesService.name);

  constructor(
    private battlesService: BattlesService,

    private statsService: StatsService,
  ) {}

  async handleProfileBattles(profile: Profile) {
    if (profile?.id) {
      const data = await this.handleBattlesQuery(profile);

      if (data?.items) {
        await this.handleBattlesData(profile.id, data.items);
      }
    }
  }

  private async handleBattlesQuery(profile: Profile) {
    try {
      const profileTag = encodeURIComponent(profile.tag);
      const response = await ky.get(
        `${process.env.BRAWL_STARS_API_URL}/players/${profileTag}/battlelog`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BRAWL_STARS_API_KEY}`,
          },
        },
      );

      return response.json<{
        items: Array<CreateBattleDto>;
      }>();
    } catch (e) {
      this.logger.debug(e);
      return null;
    }
  }

  private async handleBattlesData(
    profileId: string,
    items: Array<CreateBattleDto>,
  ) {
    if (items) {
      for (const item of items) {
        try {
          await this.battlesService.create({
            profileId,
            ...item,
          });
        } catch (e) {
          this.logger.debug(e);
        }
      }
    }
  }

  async handleProfileStats(profile: Profile) {
    if (profile.id) {
      const data = await this.handleStatsQuery(profile);
      await this.handleStatsData(profile.id, data);
    }
  }

  private async handleStatsQuery(profile: Profile) {
    try {
      const profileTag = encodeURIComponent(profile.tag);
      const response = await ky.get(
        `${process.env.BRAWL_STARS_API_URL}/players/${profileTag}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BRAWL_STARS_API_KEY}`,
          },
        },
      );

      return response.json<CreateStatDto>();
    } catch (e) {
      this.logger.debug(e);
    }
  }

  private async handleStatsData(profileId: string, data: CreateStatDto) {
    if (data) {
      try {
        await this.statsService.create({
          profileId,
          ...data,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          trioVictories: data['3vs3Victories'],
        });
      } catch (e) {
        this.logger.debug(e);
      }
    }
  }
}
