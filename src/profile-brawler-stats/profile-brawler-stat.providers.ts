import { DataSource } from 'typeorm';
import { ProfileBrawlerStat } from './profile-brawler-stat.entity';

export const profileBrawlerStatProviders = [
  {
    provide: 'PROFILE_BRAWLER_STAT_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProfileBrawlerStat),
    inject: ['DATA_SOURCE'],
  },
];
