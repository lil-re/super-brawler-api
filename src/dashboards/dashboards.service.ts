import * as dayjs from 'dayjs';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Battle } from '../battles/battle.entity';
import { Stat } from '../stats/stat.entity';
import { FilterBattleDto } from '../battles/dto/filter-battle.dto';
import { FilterStatDto } from '../stats/dto/filter-stat.dto';
import {
  SearchBattleDto,
  SearchEventMode,
  SearchEventType,
  SearchMapType,
} from '../battles/dto/search-battle.dto';

@Injectable()
export class DashboardsService {
  constructor(
    @Inject('STAT_REPOSITORY')
    private statRepository: Repository<Stat>,

    @Inject('BATTLE_REPOSITORY')
    private battleRepository: Repository<Battle>,
  ) {}

  /**
   * Profile stats
   *
   * @param profile
   * @param filters
   */
  async profileStats(profile, filters: FilterStatDto) {
    return this.statRepository
      .createQueryBuilder('stat')
      .innerJoin(
        (subQuery) => {
          subQuery
            .select('MAX(stat.createdAt)', 'max_createdAt')
            .from(Stat, 'stat');

          if (filters.dateRange === 'thisMonth') {
            subQuery
              .where('stat.createdAt >= CURDATE() - INTERVAL 30 DAY')
              .groupBy('DAY(stat.createdAt)');
          } else if (filters.dateRange === 'thisYear') {
            subQuery
              .where('stat.createdAt >= CURDATE() - INTERVAL 12 MONTH')
              .groupBy('MONTH(stat.createdAt)');
          } else if (filters.dateRange === 'last10Years') {
            subQuery
              .where('stat.createdAt >= CURDATE() - INTERVAL 10 YEAR')
              .groupBy('YEAR(stat.createdAt)');
          } else {
            subQuery
              .where('stat.createdAt >= CURDATE() - INTERVAL 7 DAY')
              .groupBy('DAY(stat.createdAt)');
          }
          return subQuery.where('stat.profileId = :profileId', { profileId: profile.id });
        },
        'latest_stats',
        'stat.createdAt = latest_stats.max_createdAt',
      )
      .orderBy('stat.createdAt', 'ASC')
      .select([
        'stat.trophies',
        'stat.trioVictories',
        'stat.duoVictories',
        'stat.soloVictories',
        'stat.createdAt',
      ])
      .where('stat.profileId = :profileId', { profileId: profile.id })
      .getMany();
  }

  /**
   * Battles history
   *
   * @param profile
   * @param filters
   */
  async battleHistory(profile, filters: SearchBattleDto) {
    const items = await this.getSearchResults(profile, filters);
    const pages = await this.getSearchCount(profile, filters);

    return {
      items,
      pages: Number(pages.pageCount),
    };
  }

  async getSearchCount(profile, filters: SearchBattleDto) {
    const {
      pageSize,
      date,
      dateRange,
      eventType,
      eventMode,
      mapType,
      brawlerName,
    } = filters;

    let query = this.battleRepository
      .createQueryBuilder('battle')
      .innerJoin('battle.event', 'event')
      .innerJoin('battle.players', 'player')
      .select('CEIL(COUNT(battle.id) / :pageSize)', 'pageCount')
      .setParameter('pageSize', pageSize)
      .andWhere('player.tag = :playerTag', { playerTag: profile.tag })
      .andWhere('battle.profileId = :profileId', { profileId: profile.id });

    // Filter by event mode (team vs team or showdown)
    query = this.searchByEventType(query, eventType, eventMode);

    // Filter by map type (community maps or official map)
    query = this.searchByMapType(query, mapType);

    // Filter by brawler name
    query = this.searchByBrawler(query, brawlerName);

    // Filter by exact date
    query = this.searchByDate(query, date, dateRange);

    // Execute the query and return results
    return await query.getRawOne();
  }

  async getSearchResults(profile, filters: SearchBattleDto) {
    const { date, dateRange, eventType, eventMode, mapType, brawlerName } =
      filters;

    // Base query
    let query = this.battleRepository
      .createQueryBuilder('battle')
      .innerJoin('battle.event', 'event')
      .addSelect('event.map')
      .addSelect('event.mode')
      .innerJoin('battle.players', 'player')
      .addSelect('player.brawlerName')
      .andWhere('player.tag = :playerTag', { playerTag: profile.tag })
      .andWhere('battle.profileId = :profileId', { profileId: profile.id });

    // Filter by event mode (team vs team or showdown)
    query = this.searchByEventType(query, eventType, eventMode);

    // Filter by map type (community maps or official map)
    query = this.searchByMapType(query, mapType);

    // Filter by brawler name
    query = this.searchByBrawler(query, brawlerName);

    // Filter by exact date
    query = this.searchByDate(query, date, dateRange);

    // Pagination
    query = this.paginateSearch(query, profile, filters);

    // Execute the query and return results
    return await query.getMany();
  }

  searchByEventType(
    query: SelectQueryBuilder<Battle>,
    eventType: SearchEventType,
    eventMode: SearchEventMode,
  ): SelectQueryBuilder<Battle> {
    // Filter by event type : team vs team or showdown
    if (eventType === 'showdown') {
      query.andWhere('battle.rank is not null');
    } else if (eventType === 'teamVsTeam') {
      query.andWhere('battle.rank is null');
    }

    // Filter by event mode : gem grab, heist, solo/duo showdown...
    if (eventMode !== 'all') {
      query.andWhere('event.mode = :mode', { mode: eventMode });
    }
    return query;
  }

  searchByMapType(
    query: SelectQueryBuilder<Battle>,
    mapType: SearchMapType,
  ): SelectQueryBuilder<Battle> {
    if (mapType === 'community') {
      query.andWhere('event.eventId is null');
    } else if (mapType === 'original') {
      query.andWhere('event.eventId is not null');
    }
    return query;
  }

  searchByBrawler(
    query: SelectQueryBuilder<Battle>,
    brawlerName: string,
  ): SelectQueryBuilder<Battle> {
    if (brawlerName && brawlerName !== 'all') {
      query = query.andWhere('player.brawlerName = :brawlerName', {
        brawlerName,
      });
    }
    return query;
  }

  searchByDate(
    query: SelectQueryBuilder<Battle>,
    date: string,
    dateRange: string,
  ): SelectQueryBuilder<Battle> {
    // Filter by exact date
    if (date) {
      query.andWhere('DATE(battle.battleTime) = :date', { date });
    }
    // Or filter by date range
    else if (dateRange) {
      const today = dayjs
        .utc()
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0);
      let startOfRange;

      switch (dateRange) {
        case 'thisWeek':
          startOfRange = today.clone().subtract(1, 'week');
          break;
        case 'thisMonth':
          startOfRange = today.clone().subtract(1, 'month');
          break;
        case 'thisYear':
          startOfRange = today.clone().subtract(1, 'year');
          break;
        default:
          startOfRange = today;
      }

      query = query.andWhere('battle.battleTime >= :startOfRange', {
        startOfRange: startOfRange.format(),
      });
    }
    return query;
  }

  paginateSearch(
    query: SelectQueryBuilder<Battle>,
    profile,
    filters: SearchBattleDto,
  ): SelectQueryBuilder<Battle> {
    const {
      page,
      pageSize,
      date,
      dateRange,
      eventType,
      eventMode,
      mapType,
      brawlerName,
    } = filters;

    return query
      .innerJoin(
        (subQuery: SelectQueryBuilder<Battle>) => {
          subQuery
            .select('battle.id as joinedId')
            .from(Battle, 'battle')
            .innerJoin('battle.event', 'event')
            .addSelect('event.map')
            .addSelect('event.mode')
            .innerJoin('battle.players', 'player')
            .andWhere('player.tag = :playerTag', { playerTag: profile.tag })
            .andWhere('battle.profileId = :profileId', {
              profileId: profile.id,
            })
            .orderBy('battle.battleTime', 'DESC');

          // Filter by event type (team vs team or showdown)
          subQuery = this.searchByEventType(subQuery, eventType, eventMode);

          // Filter by map type (community maps or original map)
          subQuery = this.searchByMapType(subQuery, mapType);

          // Filter by brawler name
          subQuery = this.searchByBrawler(subQuery, brawlerName);

          // Filter by exact date
          subQuery = this.searchByDate(subQuery, date, dateRange);

          return subQuery.limit(pageSize).offset((page - 1) * pageSize);
        },
        'battle2',
        'battle.id = battle2.joinedId',
      )
      .orderBy('battle.battleTime', 'DESC');
  }

  /**
   * Battle stats
   *
   * @param profile
   * @param filters
   */
  async battlesStats(profile, filters: FilterBattleDto) {
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

  async getBattlesInDateRange(profile, filters: FilterBattleDto) {
    let battleQuery = this.battleRepository
      .createQueryBuilder('battle')
      .select([
        'count(battle.id) as numberOfBattles',
        'battle.result as battleResult',
      ])
      .where('battle.profileId = :profileId', { profileId: profile.id })
      .andWhere('battle.result is not null');

    battleQuery = this.filterBattleByDateRange(battleQuery, filters);
    battleQuery = this.groupByBattleByDateRange(battleQuery, filters, true);

    const results = await battleQuery.getRawMany();

    return results.map((item) => ({
      ...item,
      numberOfBattles: Number(item.numberOfBattles),
    }));
  }

  async getBattlesPerEvent(profile, filters: FilterBattleDto) {
    let battleQuery = this.battleRepository
      .createQueryBuilder('battle')
      .innerJoin('event', 'event', 'event.id = battle.eventId')
      .select([
        'count(battle.id) as numberOfBattles',
        'event.mode as mode',
        'battle.result as battleResult',
      ])
      .where('battle.profileId = :profileId', { profileId: profile.id })
      .orderBy('event.mode', 'ASC')
      .groupBy('event.mode, battleResult');

    battleQuery = this.filterBattleByDateRange(battleQuery, filters);

    const results = await battleQuery.getRawMany();

    return results.map((item) => ({
      ...item,
      numberOfBattles: Number(item.numberOfBattles),
    }));
  }

  async getTrophyChangeInDateRange(profile, filters: FilterBattleDto) {
    let battleQuery = this.battleRepository
      .createQueryBuilder('battle')
      .select([
        'avg(battle.trophyChange) as averageTrophyChange',
        'sum(battle.trophyChange) as totalTrophyChange',
      ])
      .where('battle.profileId = :profileId', { profileId: profile.id });

    battleQuery = this.filterBattleByDateRange(battleQuery, filters);
    battleQuery = this.groupByBattleByDateRange(battleQuery, filters);

    const results = await battleQuery.getRawMany();

    return results.map((item) => ({
      ...item,
      averageTrophyChange: Number(item.averageTrophyChange),
      totalTrophyChange: Number(item.totalTrophyChange),
    }));
  }

  async getTrophyChangePerMode(profile, filters: FilterBattleDto) {
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

    battleQuery = this.filterBattleByDateRange(battleQuery, filters);

    const results = await battleQuery.getRawMany();

    return results.map((item) => ({
      ...item,
      averageTrophyChange: Number(item.averageTrophyChange),
      totalTrophyChange: Number(item.totalTrophyChange),
    }));
  }

  filterBattleByDateRange(
    battleQuery: SelectQueryBuilder<Battle>,
    filters: FilterBattleDto,
  ): SelectQueryBuilder<Battle> {
    if (filters.dateRange === 'thisMonth') {
      battleQuery.andWhere('battle.battleTime >= CURDATE() - INTERVAL 1 MONTH');
    } else if (filters.dateRange === 'thisYear') {
      battleQuery.andWhere('battle.battleTime >= CURDATE() - INTERVAL 1 YEAR');
    } else if (filters.dateRange === 'last10Years') {
      battleQuery.andWhere('battle.battleTime >= CURDATE() - INTERVAL 10 YEAR');
    } else {
      battleQuery.andWhere('battle.battleTime >= CURDATE() - INTERVAL 1 WEEK');
    }
    return battleQuery;
  }

  groupByBattleByDateRange(
    battleQuery: SelectQueryBuilder<Battle>,
    filters: FilterBattleDto,
    includeResults: boolean = false,
  ): SelectQueryBuilder<Battle> {
    if (filters.dateRange === 'thisMonth') {
      battleQuery
        .addSelect('DATE(battle.battleTime) AS battleDate')
        .addGroupBy('battleDate');
    } else if (filters.dateRange === 'thisYear') {
      battleQuery
        .addSelect(
          "CONCAT(YEAR(battle.battleTime), '-', LPAD(MONTH(battle.battleTime), 2, '0')) AS battleDate",
        )
        .addGroupBy('battleDate');
    } else if (filters.dateRange === 'last10Years') {
      battleQuery
        .addSelect('YEAR(battle.battleTime) AS battleDate')
        .addGroupBy('battleDate');
    } else {
      battleQuery
        .addSelect('DATE(battle.battleTime) AS battleDate')
        .addGroupBy('battleDate');
    }

    if (includeResults) {
      battleQuery.addGroupBy('battle.result');
    }

    battleQuery.orderBy('battleDate');
    return battleQuery;
  }

  /**
   * Brawler stats
   *
   * @param profile
   */
  async brawlersStats(profile, filters: FilterBattleDto) {
    const battlesPerBrawler = await this.getBattlesPerBrawler(profile, filters);
    const trophyChangePerBrawler = await this.getAverageTrophyChangePerBrawler(
      profile,
      filters,
    );

    return {
      battlesPerBrawler,
      trophyChangePerBrawler,
    };
  }

  async getBattlesPerBrawler(profile, filters: FilterBattleDto) {
    let battleQuery = this.battleRepository
      .createQueryBuilder('battle')
      .innerJoin('player', 'player', 'player.battleId = battle.id')
      .select([
        'count(battle.id) as numberOfBattles',
        'player.brawlerName as brawlerName',
        'battle.result as battleResult',
      ])
      .where('battle.profileId = :profileId', { profileId: profile.id })
      .andWhere('player.tag = :profileTag', { profileTag: profile.tag })
      .groupBy('player.brawlerName, battleResult');

    battleQuery = this.filterBattleByDateRange(battleQuery, filters);

    const results = await battleQuery.getRawMany();
    return results.map((item) => ({
      ...item,
      numberOfBattles: Number(item.numberOfBattles),
    }));
  }

  async getAverageTrophyChangePerBrawler(profile, filters: FilterBattleDto) {
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

    battleQuery = this.filterBattleByDateRange(battleQuery, filters);

    const results = await battleQuery.getRawMany();
    return results.map((item) => ({
      ...item,
      averageTrophyChange: Number(item.averageTrophyChange),
      totalTrophyChange: Number(item.totalTrophyChange),
    }));
  }
}
