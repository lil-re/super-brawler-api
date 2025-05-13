import { Repository, SelectQueryBuilder } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Battle } from '../../battles/battle.entity';
import { FilterBattleDto } from '../../battles/dto/filter-battle.dto';
import { Profile } from '../../profiles/profile.entity';

@Injectable()
export class BattlesStatsService {
  constructor(
    @Inject('BATTLE_REPOSITORY')
    private battleRepository: Repository<Battle>,
  ) {}

  /**
   * Battles stats
   *
   * @param profile
   * @param filters
   */
  async battlesStats(profile: Profile, filters: FilterBattleDto) {
    const battlesInDateRange = await this.getBattlesInDateRange(
      profile,
      filters,
    );
    const battlesPerMode = await this.getBattlesPerEvent(profile, filters);
    const trophyChangeInDateRange = await this.getTrophyChangeInDateRange(
      profile,
      filters,
    );
    const trophyChangePerMode = await this.getTrophyChangePerMode(
      profile,
      filters,
    );

    return {
      battlesInDateRange,
      battlesPerMode,
      trophyChangeInDateRange,
      trophyChangePerMode,
    };
  }

  async getBattlesInDateRange(profile: Profile, filters: FilterBattleDto) {
    let battleQuery = this.battleRepository
      .createQueryBuilder('battle')
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
      .where('battle.result IS NOT NULL')
      .andWhere('profileId = :profileId', { profileId: profile.id });

    battleQuery = this.filterBattleByDateRange<Battle>(battleQuery, filters);
    battleQuery = this.groupByBattleByDateRange<Battle>(battleQuery, filters);

    const results = await battleQuery.getRawMany();

    return results.map((item) => ({
      ...item,
      winRate: Number(item.winRate),
    }));
  }

  async getBattlesPerEvent(profile: Profile, filters: FilterBattleDto) {
    let battleQuery = this.battleRepository
      .createQueryBuilder('battle')
      .innerJoin('event', 'event', 'event.id = battle.eventId')
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
      .addSelect('event.mode as mode')
      .where('battle.result IS NOT NULL')
      .andWhere('profileId = :profileId', { profileId: profile.id })
      .orderBy('event.mode', 'ASC')
      .groupBy('event.mode');

    battleQuery = this.filterBattleByDateRange<Battle>(battleQuery, filters);

    const results = await battleQuery.getRawMany();

    return results.map((item) => ({
      ...item,
      winRate: Number(item.winRate),
    }));
  }

  async getTrophyChangeInDateRange(profile: Profile, filters: FilterBattleDto) {
    let battleQuery = this.battleRepository
      .createQueryBuilder('battle')
      .select([
        'avg(battle.trophyChange) as averageTrophyChange',
        'sum(battle.trophyChange) as totalTrophyChange',
      ])
      .where('battle.profileId = :profileId', { profileId: profile.id });

    battleQuery = this.filterBattleByDateRange<Battle>(battleQuery, filters);
    battleQuery = this.groupByBattleByDateRange<Battle>(battleQuery, filters);

    const results = await battleQuery.getRawMany();

    return results.map((item) => ({
      ...item,
      averageTrophyChange: Number(item.averageTrophyChange),
      totalTrophyChange: Number(item.totalTrophyChange),
    }));
  }

  async getTrophyChangePerMode(profile: Profile, filters: FilterBattleDto) {
    let battleQuery = this.battleRepository
      .createQueryBuilder('battle')
      .innerJoin('event', 'event', 'event.id = battle.eventId')
      .select([
        'event.mode as mode',
        'avg(battle.trophyChange) as averageTrophyChange',
        'sum(battle.trophyChange) as totalTrophyChange',
      ])
      .where('battle.profileId = :profileId', { profileId: profile.id })
      .orderBy('event.mode', 'ASC')
      .groupBy('event.mode');

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

  groupByBattleByDateRange<T>(
    battleQuery: SelectQueryBuilder<T>,
    filters: FilterBattleDto,
    includeResults: boolean = false,
  ): SelectQueryBuilder<T> {
    if (filters.dateRange === 'thisWeek') {
      battleQuery
        .addSelect('DATE(battle.battleTime) AS battleDate')
        .addGroupBy('battleDate');
    } else if (filters.dateRange === 'thisMonth') {
      battleQuery
        .addSelect('DATE(battle.battleTime) AS battleDate')
        .addGroupBy('battleDate');
    } else if (filters.dateRange === 'thisYear') {
      battleQuery
        .addSelect(
          "CONCAT(YEAR(battle.battleTime), '-', LPAD(MONTH(battle.battleTime), 2, '0')) AS battleDate",
        )
        .addGroupBy('battleDate');
    } else if (filters.dateRange === 'allTime') {
      battleQuery
        .addSelect('YEAR(battle.battleTime) AS battleDate')
        .addGroupBy('battleDate');
    }

    if (includeResults) {
      battleQuery.addGroupBy('battle.result');
    }

    battleQuery.orderBy('battleDate');
    return battleQuery;
  }
}
