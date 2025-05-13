import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Stat } from '../../stats/stat.entity';
import { FilterStatDto } from '../../stats/dto/filter-stat.dto';
import { Profile } from '../../profiles/profile.entity';

@Injectable()
export class ProfileStatsService {
  constructor(
    @Inject('STAT_REPOSITORY')
    private statRepository: Repository<Stat>,
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
}
