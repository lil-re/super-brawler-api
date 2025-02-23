import ky from 'ky';
import * as process from 'node:process';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Profile } from '../profiles/profile.entity';
import { CreateBattleDto } from '../battles/dto/create-battle.dto';
import { CreateStatDto } from '../stats/dto/create-stat.dto';
import { ProfilesService } from '../profiles/profiles.service';
import { BattlesService } from '../battles/battles.service';
import { StatsService } from '../stats/stats.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(BattlesService.name);

  constructor(
    private profilesService: ProfilesService,

    private battlesService: BattlesService,

    private statsService: StatsService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async battlesCron() {
    const profiles = await this.profilesService.findAll();

    for (const profile of profiles) {
      const data = await this.handleBattlesCronQuery(profile);

      if (data?.items) {
        await this.handleBattlesCronData(profile, data.items);
      }
    }
  }

  private async handleBattlesCronQuery(profile: Profile) {
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
    } catch {
      this.logger.debug(
        `Error while fetching latest battles for profile with tag ${profile.tag}`,
      );
      return null;
    }
  }

  private async handleBattlesCronData(
    profile: Profile,
    items: Array<CreateBattleDto>,
  ) {
    if (items) {
      for (const item of items) {
        try {
          const battle = await this.battlesService.create(item);

          if (battle.id) {
            this.logger.debug(
              `Add one battle for player with tag ${profile.tag}`,
            );
          }
        } catch (e) {
          this.logger.debug(e);
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_4_HOURS)
  async statsCron() {
    const profiles = await this.profilesService.findAll();

    for (const profile of profiles) {
      const data = await this.handleStatsCronQuery(profile);
      await this.handleStatsCronData(profile, data);
    }
  }

  private async handleStatsCronQuery(profile: Profile) {
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
    } catch {
      this.logger.debug(
        `Error while fetching latest battles for profile with tag ${profile.tag}`,
      );
      return null;
    }
  }

  private async handleStatsCronData(profile: Profile, data: CreateStatDto) {
    if (data) {
      try {
        const stat = await this.statsService.create({
          ...data,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          trioVictories: data['3vs3Victories'],
        });

        if (stat.id) {
          this.logger.debug(`Add stats for player with tag ${profile.tag}`);
        }
      } catch (e) {
        this.logger.debug(e);
      }
    }
  }
}
