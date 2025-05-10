import * as dayjs from 'dayjs';
import {
  DataSource,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
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
  SearchResult,
} from '../battles/dto/search-battle.dto';
import { Profile } from '../profiles/profile.entity';
import { SearchProfileBrawlerDto } from '../profile-brawlers/dto/search-profile-brawler.dto';
import { ProfileBrawler } from '../profile-brawlers/profile-brawler.entity';
import { User } from '../users/user.entity';

@Injectable()
export class DashboardsService {
  constructor(
    @Inject('DATA_SOURCE')
    private dataSource: DataSource,

    @Inject('STAT_REPOSITORY')
    private statRepository: Repository<Stat>,

    @Inject('BATTLE_REPOSITORY')
    private battleRepository: Repository<Battle>,

    @Inject('PROFILE_BRAWLER_REPOSITORY')
    private profileBrawlerRepository: Repository<ProfileBrawler>,
  ) {}

  /**
   * Profile stats
   *
   * @param profile
   * @param filters
   */
  async profileStats(profile: Profile, filters: FilterStatDto) {
    const query = this.statRepository
      .createQueryBuilder('stat')
      .select([
        'MAX(stat.trophies) AS totalTrophies',
        'MAX(stat.trioVictories) AS totalTrioVictories',
        'MAX(stat.duoVictories) AS totalDuoVictories',
        'MAX(stat.soloVictories) AS totalSoloVictories',
      ])
      .where('stat.profileId = :profileId', { profileId: profile.id });

    if (!filters.dateRange || filters.dateRange === 'thisWeek') {
      query
        .addSelect('stat.createdAt as statDate')
        .andWhere('stat.createdAt >= CURDATE() - INTERVAL 7 DAY')
        .orderBy('statDate')
        .groupBy('statDate');
    } else if (filters.dateRange === 'thisMonth') {
      query
        .addSelect('stat.createdAt as statDate')
        .andWhere('stat.createdAt >= CURDATE() - INTERVAL 30 DAY')
        .orderBy('statDate')
        .groupBy('statDate');
    } else if (filters.dateRange === 'thisYear') {
      query
        .addSelect("DATE_FORMAT(stat.createdAt, '%Y-%m') AS statDate")
        .andWhere('stat.createdAt >= CURDATE() - INTERVAL 12 MONTH')
        .orderBy('statDate')
        .groupBy('statDate');
    } else if (filters.dateRange === 'allTime') {
      query
        .addSelect('YEAR(stat.createdAt) AS statDate')
        .orderBy('statDate')
        .groupBy('statDate');
    }

    return query.getRawMany();
  }

  /**
   * Battles history
   *
   * @param profile
   * @param filters
   */
  async battleLog(profile: Profile, filters: SearchBattleDto) {
    const items = await this.getBattleLogResults(profile, filters);
    const pages = await this.getBattleLogCount(profile, filters);

    return {
      items,
      pages: Number(pages.pageCount),
    };
  }

  async getBattleLogCount(profile: Profile, filters: SearchBattleDto) {
    const {
      pageSize,
      date,
      dateRange,
      eventType,
      eventMode,
      mapType,
      brawlerName,
      result,
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
    query = this.filterBattleLogByEventType(query, eventType, eventMode);

    // Filter by map type (community maps or official map)
    query = this.filterBattleLogByMapType(query, mapType);

    // Filter by brawler name
    query = this.filterBattleLogByBrawler(query, brawlerName);

    // Filter by battle result
    query = this.filterBattleLogByResult(query, result);

    // Filter by exact date
    query = this.filterBattleLogByDate(query, date, dateRange);

    // Execute the query and return results
    return await query.getRawOne();
  }

  async getBattleLogResults(profile: Profile, filters: SearchBattleDto) {
    const {
      date,
      dateRange,
      eventType,
      eventMode,
      mapType,
      brawlerName,
      result,
    } = filters;

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
    query = this.filterBattleLogByEventType(query, eventType, eventMode);

    // Filter by map type (community maps or official map)
    query = this.filterBattleLogByMapType(query, mapType);

    // Filter by brawler name
    query = this.filterBattleLogByBrawler(query, brawlerName);

    // Filter by battle result
    query = this.filterBattleLogByResult(query, result);

    // Filter by exact date
    query = this.filterBattleLogByDate(query, date, dateRange);

    // Pagination
    query = this.paginateBattleLog(query, profile, filters);

    // Execute the query and return results
    return await query.getMany();
  }

  paginateBattleLog(
    query: SelectQueryBuilder<Battle>,
    profile: Profile,
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
      result,
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
          subQuery = this.filterBattleLogByEventType(
            subQuery,
            eventType,
            eventMode,
          );

          // Filter by map type (community maps or original map)
          subQuery = this.filterBattleLogByMapType(subQuery, mapType);

          // Filter by brawler name
          subQuery = this.filterBattleLogByBrawler(subQuery, brawlerName);

          // Filter by battle result
          subQuery = this.filterBattleLogByResult(subQuery, result);

          // Filter by exact date
          subQuery = this.filterBattleLogByDate(subQuery, date, dateRange);

          return subQuery.limit(pageSize).offset((page - 1) * pageSize);
        },
        'battle2',
        'battle.id = battle2.joinedId',
      )
      .orderBy('battle.battleTime', 'DESC');
  }

  filterBattleLogByEventType(
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

  filterBattleLogByMapType(
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

  filterBattleLogByBrawler(
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

  filterBattleLogByResult(
    query: SelectQueryBuilder<Battle>,
    result: SearchResult,
  ): SelectQueryBuilder<Battle> {
    if (result && result !== 'all') {
      query.andWhere('battle.result = :result', { result });
    }
    return query;
  }

  filterBattleLogByDate(
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

  /**
   * Battle stats
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

  /**
   * Brawlers list
   *
   * @param profile
   * @param filters
   */
  async brawlersList(profile: Profile, filters: SearchProfileBrawlerDto) {
    const items = await this.getBrawlersListResults(profile, filters);
    const pages = await this.getBrawlersListCount(profile, filters);

    return {
      items,
      pages: Number(pages.pageCount),
    };
  }

  async getBrawlersListCount(
    profile: Profile,
    filters: SearchProfileBrawlerDto,
  ) {
    const { pageSize, search } = filters;

    let query = this.profileBrawlerRepository
      .createQueryBuilder('profileBrawler')
      .innerJoin('profileBrawler.brawler', 'brawler')
      .innerJoin('profileBrawler.profile', 'profile')
      .select('CEIL(COUNT(profileBrawler.id) / :pageSize)', 'pageCount')
      .setParameter('pageSize', pageSize)
      .andWhere('profile.tag = :playerTag', { playerTag: profile.tag });

    // Search brawlers
    query = this.searchBrawlersList(query, search);

    // Execute the query and return results
    return await query.getRawOne();
  }

  async getBrawlersListResults(
    profile: Profile,
    filters: SearchProfileBrawlerDto,
  ) {
    const { search, orderByValue, orderByDirection } = filters;

    // Base query
    let query = this.profileBrawlerRepository
      .createQueryBuilder('profileBrawler')
      .innerJoin('profileBrawler.brawler', 'brawler')
      .innerJoin('profileBrawler.profile', 'profile')
      .addSelect('brawler.label')
      .andWhere('profile.tag = :playerTag', { playerTag: profile.tag });

    // Search brawlers
    query = this.searchBrawlersList(query, search);

    // Pagination
    query = this.paginateBrawlersList(query, profile, filters);

    // Order brawlers list
    query = this.orderBrawlersListByValue(query, orderByValue, orderByDirection);

    // Execute the query and return results
    return await query.getMany();
  }

  paginateBrawlersList(
    query: SelectQueryBuilder<ProfileBrawler>,
    profile: Profile,
    filters: SearchProfileBrawlerDto,
  ): SelectQueryBuilder<ProfileBrawler> {
    const { page, pageSize, search, orderByValue, orderByDirection } = filters;

    return query.innerJoin(
      (subQuery: SelectQueryBuilder<ProfileBrawler>) => {
        subQuery
          .select('profileBrawlerPage.id as joinedId')
          .from(ProfileBrawler, 'profileBrawlerPage')
          .innerJoin('profileBrawlerPage.brawler', 'brawler')
          .innerJoin('profileBrawlerPage.profile', 'profile')
          .andWhere('profile.tag = :playerTag', { playerTag: profile.tag });

        // Search brawlers
        subQuery = this.searchBrawlersList(subQuery, search);

        // Order brawlers list
        subQuery = this.orderBrawlersListByValue(
          subQuery,
          orderByValue,
          orderByDirection,
          'profileBrawlerPage',
        );

        return subQuery.limit(pageSize).offset((page - 1) * pageSize);
      },
      'profileBrawler2',
      'profileBrawler.id = profileBrawler2.joinedId',
    );
  }

  private searchBrawlersList(
    query: SelectQueryBuilder<ProfileBrawler>,
    search: string,
  ): SelectQueryBuilder<ProfileBrawler> {
    if (search && search.length > 0) {
      query.andWhere('brawler.label LIKE :search', { search: `%${search}%` });
    }

    return query;
  }

  private orderBrawlersListByValue(
    query: SelectQueryBuilder<ProfileBrawler>,
    orderByValue: string,
    orderByDirection: 'ASC' | 'DESC',
    alias: string = 'profileBrawler',
  ): SelectQueryBuilder<ProfileBrawler> {
    console.log(orderByValue, orderByDirection);
    if (orderByValue && orderByValue.length > 0 && orderByDirection) {
      if (orderByValue === 'label') {
        query.orderBy('brawler.label', orderByDirection);
      } else {
        query.orderBy(`${alias}.${orderByValue}`, orderByDirection);
      }
    } else {
      query.orderBy('trophies', 'DESC');
    }

    return query;
  }

  /**
   * Brawler stats
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

  async profileBrawlers(profileId: string) {
    const data = await this.battleRepository
      .createQueryBuilder('battle')
      .select(['player.brawlerName'])
      .innerJoin('battle.players', 'player')
      .where('battle.profileId = :profileId', { profileId })
      .groupBy('player.brawlerName')
      .distinct(true)
      .getRawMany();
    return data.map((item) => item.player_brawlerName);
  }
}
