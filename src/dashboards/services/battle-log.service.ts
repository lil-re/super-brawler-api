import * as dayjs from 'dayjs';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Battle } from '../../battles/battle.entity';
import {
  SearchBattleDto,
  SearchEventMode,
  SearchEventType,
  SearchMapType,
  SearchResult,
} from '../../battles/dto/search-battle.dto';
import { Profile } from '../../profiles/profile.entity';

@Injectable()
export class BattleLogService {
  constructor(
    @Inject('BATTLE_REPOSITORY')
    private battleRepository: Repository<Battle>,
  ) {}

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

  private async getBattleLogCount(profile: Profile, filters: SearchBattleDto) {
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

  private async getBattleLogResults(
    profile: Profile,
    filters: SearchBattleDto,
  ) {
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

  private paginateBattleLog(
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

  private filterBattleLogByEventType(
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

  private filterBattleLogByMapType(
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

  private filterBattleLogByBrawler(
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

  private filterBattleLogByResult(
    query: SelectQueryBuilder<Battle>,
    result: SearchResult,
  ): SelectQueryBuilder<Battle> {
    if (result && result !== 'all') {
      query.andWhere('battle.result = :result', { result });
    }
    return query;
  }

  private filterBattleLogByDate(
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

  async battleLogBrawlers(profileId: string) {
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
