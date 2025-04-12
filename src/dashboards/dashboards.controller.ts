import {
  Body,
  Controller,
  Param,
  Post,
} from '@nestjs/common';
import { FilterStatDto } from '../stats/dto/filter-stat.dto';
import { FilterBattleDto } from '../battles/dto/filter-battle.dto';
import { DashboardsService } from './dashboards.service';
import { SearchBattleDto } from '../battles/dto/search-battle.dto';
import { ProfilesService } from '../profiles/profiles.service';

@Controller('dashboards')
export class DashboardsController {
  constructor(
    private readonly profilesService: ProfilesService,

    private readonly dashboardsService: DashboardsService,
  ) {}

  @Post(':tag/profile-stats')
  async stats(@Param('tag') tag: string, @Body() filterStatDto: FilterStatDto) {
    const profile = await this.profilesService.findOneByTag(tag);
    const stats = await this.dashboardsService.profileStats(
      profile,
      filterStatDto,
    );
    return { profile, stats };
  }

  @Post(':tag/battles-history')
  async search(
    @Param('tag') tag: string,
    @Body() searchBattleDto: SearchBattleDto,
  ) {
    const profile = await this.profilesService.findOneByTag(tag);
    const brawlers = await this.dashboardsService.profileBrawlers(profile.id);
    const history = await this.dashboardsService.battleHistory(
      profile,
      searchBattleDto,
    );
    return { profile, brawlers, history };
  }

  @Post(':tag/battles-stats')
  async battles(
    @Param('tag') tag: string,
    @Body() filterBattleDto: FilterBattleDto,
  ) {
    const profile = await this.profilesService.findOneByTag(tag);
    const stats = await this.dashboardsService.battlesStats(
      profile,
      filterBattleDto,
    );
    return { profile, stats };
  }

  @Post(':tag/brawlers-stats')
  async players(
    @Param('tag') tag: string,
    @Body() filterBattleDto: FilterBattleDto,
  ) {
    const profile = await this.profilesService.findOneByTag(tag);
    const stats = await this.dashboardsService.brawlersStats(
      profile,
      filterBattleDto,
    );
    return { profile, stats };
  }
}
