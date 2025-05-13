import { Repository, SelectQueryBuilder } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Battle } from '../../battles/battle.entity';
import { FilterBattleDto } from '../../battles/dto/filter-battle.dto';
import { Profile } from '../../profiles/profile.entity';

@Injectable()
export class BrawlersStatsService {
  constructor(
    @Inject('BATTLE_REPOSITORY')
    private battleRepository: Repository<Battle>,
  ) {}

  /**
   * Brawlers stats
   *
   * @param profile
   * @param filters
   */
  async brawlersStats(profile: Profile, filters: FilterBattleDto) {
    const battlesPerBrawler = await this.getBattlesPerBrawler(profile, filters);
    const trophyChangePerBrawler = await this.getTrophyChangePerBrawler(
      profile,
      filters,
    );

    return {
      battlesPerBrawler,
      trophyChangePerBrawler,
    };
  }

  async getBattlesPerBrawler(profile: Profile, filters: FilterBattleDto) {
    let battleQuery = this.battleRepository
      .createQueryBuilder('battle')
      .innerJoin('player', 'player', 'player.battleId = battle.id')
      .select(
        `
          ROUND(
            SUM(CASE WHEN battle.result = :victory THEN 1 ELSE 0 END) 
            / COUNT(*) * 100, 
            2
          )
        `,
        'winRate',
      )
      .setParameter('victory', 'victory')
      .addSelect("SUM(result = 'victory') as victories")
      .addSelect("SUM(result = 'defeat') as defeats")
      .addSelect("SUM(result = 'draw') as draws")
      .addSelect('player.brawlerName as brawlerName')
      .where('battle.result IS NOT NULL')
      .andWhere('profileId = :profileId', { profileId: profile.id })
      .andWhere('player.tag = :profileTag', { profileTag: profile.tag })
      .groupBy('player.brawlerName');

    battleQuery = this.filterBattleByDateRange<Battle>(battleQuery, filters);

    const results = await battleQuery.getRawMany();
    return results.map((item) => ({
      ...item,
      numberOfBattles: Number(item.numberOfBattles),
    }));
  }

  async getTrophyChangePerBrawler(profile: Profile, filters: FilterBattleDto) {
    let battleQuery = this.battleRepository
      .createQueryBuilder('battle')
      .innerJoin('player', 'player', 'player.battleId = battle.id')
      .select([
        'player.brawlerName as brawlerName',
        'avg(battle.trophyChange) as averageTrophyChange',
        'sum(battle.trophyChange) as totalTrophyChange',
      ])
      .where('battle.profileId = :profileId', { profileId: profile.id })
      .andWhere('player.tag = :profileTag', { profileTag: profile.tag })
      .groupBy('player.brawlerName');

    battleQuery = this.filterBattleByDateRange<Battle>(battleQuery, filters);

    const results = await battleQuery.getRawMany();
    return results.map((item) => ({
      ...item,
      averageTrophyChange: Number(item.averageTrophyChange),
      totalTrophyChange: Number(item.totalTrophyChange),
    }));
  }

  filterBattleByDateRange<T>(
    battleQuery: SelectQueryBuilder<T>,
    filters: FilterBattleDto,
  ): SelectQueryBuilder<T> {
    if (filters.dateRange === 'thisWeek') {
      battleQuery.andWhere('battle.battleTime >= CURDATE() - INTERVAL 1 WEEK');
    } else if (filters.dateRange === 'thisMonth') {
      battleQuery.andWhere('battle.battleTime >= CURDATE() - INTERVAL 1 MONTH');
    } else if (filters.dateRange === 'thisYear') {
      battleQuery.andWhere('battle.battleTime >= CURDATE() - INTERVAL 1 YEAR');
    } else if (filters.dateRange === 'allTime') {
      return battleQuery;
    }
    return battleQuery;
  }
}
