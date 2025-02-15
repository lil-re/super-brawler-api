import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ProfileGuard } from '../auth/profile.guard';
import { FilterStatDto } from '../stats/dto/filter-stat.dto';
import { FilterBattleDto } from '../battles/dto/filter-battle.dto';
import { DashboardsService } from './dashboards.service';

@Controller('dashboards')
export class DashboardsController {
  constructor(
    private readonly dashboardsService: DashboardsService
  ) {}

  @UseGuards(ProfileGuard)
  @Post('/stats')
  stats(@Request() req, @Body() filterStatDto: FilterStatDto) {
    return this.dashboardsService.stats(req.profile, filterStatDto);
  }

  @UseGuards(ProfileGuard)
  @Post('/battles')
  battles(@Request() req, @Body() battleStatDto: FilterBattleDto) {
    return this.dashboardsService.battles(req.profile, battleStatDto);
  }

  @UseGuards(ProfileGuard)
  @Post('/players')
  players(@Request() req) {
    return this.dashboardsService.players(req.profile);
  }
}
