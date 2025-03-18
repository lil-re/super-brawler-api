import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ProfileGuard } from '../auth/profile.guard';
import { FilterStatDto } from '../stats/dto/filter-stat.dto';
import { FilterBattleDto } from '../battles/dto/filter-battle.dto';
import { DashboardsService } from './dashboards.service';
import { SearchBattleDto } from '../battles/dto/search-battle.dto';

@Controller('dashboards')
export class DashboardsController {
  constructor(
    private readonly dashboardsService: DashboardsService
  ) {}

  @UseGuards(ProfileGuard)
  @Post('/profile-stats')
  stats(@Request() req, @Body() filterStatDto: FilterStatDto) {
    return this.dashboardsService.profileStats(req.profile, filterStatDto);
  }

  @UseGuards(ProfileGuard)
  @Post('/battles-history')
  search(@Request() req, @Body() searchBattleDto: SearchBattleDto) {
    return this.dashboardsService.battleHistory(req.profile, searchBattleDto);
  }

  @UseGuards(ProfileGuard)
  @Post('/battles-stats')
  battles(@Request() req, @Body() filterBattleDto: FilterBattleDto) {
    return this.dashboardsService.battlesStats(req.profile, filterBattleDto);
  }

  @UseGuards(ProfileGuard)
  @Post('/brawlers-stats')
  players(@Request() req, @Body() filterBattleDto: FilterBattleDto) {
    return this.dashboardsService.brawlersStats(req.profile, filterBattleDto);
  }
}
