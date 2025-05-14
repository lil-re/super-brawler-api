import { Body, Controller, Param, Post } from '@nestjs/common';
import { FilterStatDto } from '../stats/dto/filter-stat.dto';
import { FilterBattleDto } from '../battles/dto/filter-battle.dto';
import { SearchBattleDto } from '../battles/dto/search-battle.dto';
import { ProfilesService } from '../profiles/profiles.service';
import { BattleLogService } from './services/battle-log.service';
import { ProfileStatsService } from './services/profile-stats.service';
import { BattlesStatsService } from './services/battles-stats.service';
import { BrawlersListService } from './services/brawlers-list.service';
import { BrawlersStatsService } from './services/brawlers-stats.service';

@Controller('dashboards')
export class DashboardsController {
  constructor(
    private readonly profilesService: ProfilesService,

    private readonly profileStatsService: ProfileStatsService,

    private readonly battleLogService: BattleLogService,

    private readonly battlesStatsService: BattlesStatsService,

    private readonly brawlersListService: BrawlersListService,

    private readonly brawlersStatsService: BrawlersStatsService,
  ) {}

  @Post(':tag/profile-stats')
  async profileStats(
    @Param('tag') tag: string,
    @Body() filterStatDto: FilterStatDto,
  ) {
    const profile = await this.profilesService.findOneByTag(tag);
    const stats = await this.profileStatsService.profileStats(
      profile,
      filterStatDto,
    );
    return { profile, stats };
  }

  @Post(':tag/battle-log')
  async battleLog(
    @Param('tag') tag: string,
    @Body() searchBattleDto: SearchBattleDto,
  ) {
    const profile = await this.profilesService.findOneByTag(tag);
    const brawlers = await this.battleLogService.battleLogBrawlers(profile.id);
    const battles = await this.battleLogService.battleLog(
      profile,
      searchBattleDto,
    );
    return { profile, brawlers, battles };
  }

  @Post(':tag/battles-stats')
  async battlesStats(
    @Param('tag') tag: string,
    @Body() filterBattleDto: FilterBattleDto,
  ) {
    const profile = await this.profilesService.findOneByTag(tag);
    const stats = await this.battlesStatsService.battlesStats(
      profile,
      filterBattleDto,
    );
    return { profile, stats };
  }

  @Post(':tag/brawlers-list')
  async brawlersList(
    @Param('tag') tag: string,
    @Body() searchBattleDto: SearchBattleDto,
  ) {
    const profile = await this.profilesService.findOneByTag(tag);
    const brawlers = await this.brawlersListService.brawlersList(
      profile,
      searchBattleDto,
    );
    return { profile, brawlers };
  }

  @Post(':tag/brawlers-stats')
  async brawlersStats(
    @Param('tag') tag: string,
    @Body() filterBattleDto: FilterBattleDto,
  ) {
    const profile = await this.profilesService.findOneByTag(tag);
    const stats = await this.brawlersStatsService.brawlersStats(
      profile,
      filterBattleDto,
    );
    return { profile, stats };
  }
}
