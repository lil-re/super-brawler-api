import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ProfileGuard } from '../auth/profile.guard';
import { FilterStatDto } from '../stats/dto/filter-stat.dto';
import { FilterBattleDto } from '../battles/dto/filter-battle.dto';
import { DashboardsService } from './dashboards.service';
import { SearchBattleDto } from '../battles/dto/search-battle.dto';
import { ProfilesService } from '../profiles/profiles.service';

@Controller('dashboards')
export class DashboardsController {
  constructor(
    private readonly profilesService: ProfilesService,

    private readonly dashboardsService: DashboardsService
  ) {}

  @Post(':tag/profile-stats')
  async stats(@Param('tag') tag: string, @Body() filterStatDto: FilterStatDto) {
    const profile = await this.profilesService.findOneByTag(tag);
    return this.dashboardsService.profileStats(profile, filterStatDto);
  }

  @Post(':tag/battles-history')
  async search(@Param('tag') tag: string, @Body() searchBattleDto: SearchBattleDto) {
    const profile = await this.profilesService.findOneByTag(tag);
    return this.dashboardsService.battleHistory(profile, searchBattleDto);
  }

  @Post(':tag/battles-stats')
  async battles(@Param('tag') tag: string, @Body() filterBattleDto: FilterBattleDto) {
    const profile = await this.profilesService.findOneByTag(tag);
    return this.dashboardsService.battlesStats(profile, filterBattleDto);
  }

  @Post(':tag/brawlers-stats')
  async players(@Param('tag') tag: string, @Body() filterBattleDto: FilterBattleDto) {
    const profile = await this.profilesService.findOneByTag(tag);
    return this.dashboardsService.brawlersStats(profile, filterBattleDto);
  }
}
