import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Battle } from '../battles/battle.entity';
import { Stat } from '../stats/stat.entity';
import { FilterBattleDto } from '../battles/dto/filter-battle.dto';
import { FilterStatDto } from '../stats/dto/filter-stat.dto';

@Injectable()
export class DashboardsService {
  constructor(
    @Inject('STAT_REPOSITORY')
    private statRepository: Repository<Stat>,

    @Inject('BATTLE_REPOSITORY')
    private battleRepository: Repository<Battle>,
  ) {}

  async stats(profile, filters: FilterStatDto) {
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
          return subQuery;
        },
        'latest_stats',
        'stat.createdAt = latest_stats.max_createdAt',
      )
      .orderBy('stat.createdAt', 'DESC')
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

  async battles(profile, filters: FilterBattleDto) {
    const battlesPerDay = await this.getBattlesPerDay(profile, filters);
    const battlesPerMode = await this.getBattlesPerEvent(profile);
    const averageTrophyChangePerDay = await this.getAverageTrophyChangePerDay(profile);
    const averageTrophyChangePerMode = await this.getAverageTrophyChangePerMode(profile);

    return {
      battlesPerDay,
      battlesPerMode,
      averageTrophyChangePerDay,
      averageTrophyChangePerMode
    };
  }

  async getBattlesPerDay(profile, filters: FilterBattleDto) {
    const battleQuery = this.battleRepository
      .createQueryBuilder('battle')
      .select([
        'count(battle.id) as numberOfBattles',
        'battle.battleTime as battleTime',
        'battle.result as result',
      ])
      .where('battle.profileId = :profileId', { profileId: profile.id });

    if (filters.dateRange === 'thisMonth') {
      battleQuery
        .andWhere('battle.battleTime >= CURDATE() - INTERVAL 1 MONTH')
        .groupBy('DAY(battle.battleTime), battle.result');
    } else if (filters.dateRange === 'thisYear') {
      battleQuery
        .andWhere('battle.battleTime >= CURDATE() - INTERVAL 1 YEAR')
        .groupBy('MONTH(battle.battleTime), battle.result');
    } else if (filters.dateRange === 'last10Years') {
      battleQuery
        .andWhere('battle.battleTime >= CURDATE() - INTERVAL 10 YEAR')
        .groupBy('YEAR(battle.battleTime), battle.result');
    } else {
      battleQuery
        .andWhere('battle.battleTime >= CURDATE() - INTERVAL 1 WEEK')
        .groupBy('DAY(battle.battleTime), battle.result');
    }
    const results = await battleQuery.getRawMany();
    return results.map((item) => ({
      ...item,
      numberOfBattles: Number(item.numberOfBattles)
    }));
  }

  async getBattlesPerEvent(profile) {
    const battleQuery = this.battleRepository
      .createQueryBuilder('battle')
      .innerJoin('event', 'event', 'event.id = battle.eventId')
      .select([
        'count(battle.id) as numberOfBattles',
        'event.mode as mode',
        'battle.result as result',
      ])
      .where('battle.profileId = :profileId', { profileId: profile.id })
      .groupBy('event.mode, battle.result');

    const results = await battleQuery.getRawMany();
    return results.map((item) => ({
      ...item,
      numberOfBattles: Number(item.numberOfBattles)
    }));
  }

  async getAverageTrophyChangePerDay(profile) {
    const battleQuery = this.battleRepository
      .createQueryBuilder('battle')
      .select([
        'battle.battleTime as battleTime',
        'avg(battle.trophyChange) as averageTrophyChange',
        'sum(battle.trophyChange) as totalTrophyChange',
      ])
      .where('battle.profileId = :profileId', { profileId: profile.id })
      .groupBy('day(battle.battleTime)');

    const results = await battleQuery.getRawMany();
    return results.map((item) => ({
      ...item,
      averageTrophyChange: Number(item.averageTrophyChange),
      totalTrophyChange: Number(item.totalTrophyChange)
    }));
  }

  async getAverageTrophyChangePerMode(profile) {
    const battleQuery = this.battleRepository
      .createQueryBuilder('battle')
      .innerJoin('event', 'event', 'event.id = battle.eventId')
      .select([
        'event.mode as mode',
        'avg(battle.trophyChange) as averageTrophyChange',
        'sum(battle.trophyChange) as totalTrophyChange',
      ])
      .where('battle.profileId = :profileId', { profileId: profile.id })
      .groupBy('event.mode');

    const results = await battleQuery.getRawMany();
    return results.map((item) => ({
      ...item,
      averageTrophyChange: Number(item.averageTrophyChange),
      totalTrophyChange: Number(item.totalTrophyChange)
    }));
  }

  async players(profile) {
    const battlesPerPlayer = await this.getBattlesPerPlayer(profile);
    const averageTrophyChangePerPlayer = await this.getAverageTrophyChangePerPlayer(profile);

    return {
      battlesPerPlayer,
      averageTrophyChangePerPlayer
    };
  }

  async getBattlesPerPlayer(profile) {
    const battleQuery = this.battleRepository
      .createQueryBuilder('battle')
      .innerJoin('player', 'player', 'player.battleId = battle.id')
      .select([
        'count(battle.id) as numberOfBattles',
        'player.brawlerName as brawlerName',
        'battle.result as result',
      ])
      .where('battle.profileId = :profileId', { profileId: profile.id })
      .andWhere('player.tag = :profileTag', { profileTag: profile.tag })
      .groupBy('player.brawlerName, battle.result');

    const results = await battleQuery.getRawMany();
    return results.map((item) => ({
      ...item,
      numberOfBattles: Number(item.numberOfBattles)
    }));
  }

  async getAverageTrophyChangePerPlayer(profile) {
    const battleQuery = this.battleRepository
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

    const results = await battleQuery.getRawMany();
    return results.map((item) => ({
      ...item,
      averageTrophyChange: Number(item.averageTrophyChange),
      totalTrophyChange: Number(item.totalTrophyChange)
    }));
  }
}
