import ky from 'ky';
import * as process from 'node:process';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateBattleDto } from '../battles/dto/create-battle.dto';
import { ProfilesService } from '../profiles/profiles.service';
import { BattlesService } from '../battles/battles.service';
import { Profile } from '../profiles/profile.entity';

@Injectable()
export class CronService {
  private readonly logger = new Logger(BattlesService.name);

  constructor(
    private battlesService: BattlesService,

    private profilesService: ProfilesService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async battlesCron() {
    const profiles = await this.profilesService.findAll();

    for (const profile of profiles) {
      const data = await this.handleCronQuery(profile);
      await this.handleCronBattles(profile, data.items);
    }
  }

  private async handleCronQuery(profile: Profile) {
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

  private async handleCronBattles(
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
}
