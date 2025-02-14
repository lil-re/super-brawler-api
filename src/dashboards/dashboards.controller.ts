import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { FilterStatDto } from '../stats/dto/filter-stat.dto';
import { FilterBattleDto } from '../battles/dto/filter-battle.dto';
import { DashboardsService } from './dashboards.service';

@Controller('dashboards')
export class DashboardsController {
  constructor(
    private readonly dashboardsService: DashboardsService
  ) {}

  @UseGuards(AuthGuard)
  @Post('/stats')
  stats(@Request() req, @Body() filterStatDto: FilterStatDto) {
    return this.dashboardsService.stats(req.profile, filterStatDto);
  }

  @UseGuards(AuthGuard)
  @Post('/battles')
  battles(@Request() req, @Body() battleStatDto: FilterBattleDto) {
    return this.dashboardsService.battles(req.profile, battleStatDto);
  }

  @UseGuards(AuthGuard)
  @Post('/players')
  players(@Request() req) {
    return this.dashboardsService.players(req.profile);
  }
}
