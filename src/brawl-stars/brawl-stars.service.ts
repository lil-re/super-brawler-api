import ky from 'ky';
import * as process from 'node:process';
import { Injectable, Logger } from '@nestjs/common';
import { BattlesService } from '../battles/battles.service';
import { StatsService } from '../stats/stats.service';
import { Profile } from '../profiles/profile.entity';
import { CreateBattleDto } from '../battles/dto/create-battle.dto';
import { CreateStatDto } from '../stats/dto/create-stat.dto';
import { CreateProfileBrawlerDto } from '../profile-brawlers/dto/create-profile-brawler.dto';
import { CreateBrawlerDto } from '../brawlers/dto/create-brawler.dto';
import { BrawlersService } from '../brawlers/brawlers.service';
import { ProfileBrawlersService } from '../profile-brawlers/profile-brawlers.service';

@Injectable()
export class BrawlStarsService {
  private readonly logger = new Logger(BattlesService.name);

  constructor(
    private statsService: StatsService,

    private profileBrawlerService: ProfileBrawlersService,

    private battlesService: BattlesService,

    private brawlersService: BrawlersService,
  ) {}

  async getProfileStats(profile: Profile) {
    if (profile.id) {
      const data = await this.handleProfileQuery(profile);
      await this.handleProfileStatsData(profile, data);
      // await this.handleProfileBrawlersData(profile, data.brawlers);
    }
  }

  private async handleProfileQuery(profile: Profile) {
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

  private async handleProfileStatsData(profile: Profile, data: CreateStatDto) {
    if (data) {
      try {
        await this.statsService.createOrUpdate({
          ...data,
          profileId: profile.id,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          trioVictories: data['3vs3Victories'],
        });
      } catch (e) {
        this.logger.debug(e.message);
      }
    }
  }

  private async handleProfileBrawlersData(
    profile: Profile,
    data: Array<CreateProfileBrawlerDto>,
  ) {
    if (data) {
      try {
        for (const createProfileBrawlerDto of data) {
          await this.profileBrawlerService.createOrUpdate(
            profile,
            createProfileBrawlerDto,
          );
        }
      } catch (e) {
        this.logger.debug(e.message);
      }
    }
  }

  async getProfileBattles(profile: Profile) {
    if (profile?.id) {
      const data = await this.handleBattlesQuery(profile);

      if (data?.items) {
        await this.handleBattlesData(profile, data.items);
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
    profile: Profile,
    items: Array<CreateBattleDto>,
  ) {
    if (items) {
      for (const item of items) {
        try {
          await this.battlesService.create({
            ...item,
            profileId: profile.id,
            profileTag: profile.tag,
          });
        } catch (e) {
          this.logger.debug(e.message);
        }
      }
    }
  }

  async getBrawlers() {
    const brawlers = await this.handleBrawlersQuery();
    await this.handleBrawlersData(brawlers.items);
  }

  private async handleBrawlersQuery() {
    try {
      const response = await ky.get(
        `${process.env.BRAWL_STARS_API_URL}/brawlers`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BRAWL_STARS_API_KEY}`,
          },
        },
      );

      return response.json<{
        items: Array<CreateBrawlerDto>;
      }>();
    } catch (e) {
      this.logger.debug(e);
      return null;
    }
  }

  private async handleBrawlersData(items: Array<CreateBrawlerDto>) {
    if (items) {
      for (const item of items) {
        try {
          await this.brawlersService.create(item);
        } catch (e) {
          this.logger.debug(e.message);
        }
      }
    }
  }
}
