import { DataSource } from 'typeorm';
import { ProfileBrawler } from './profile-brawler.entity';

export const profileBrawlerProviders = [
  {
    provide: 'PROFILE_BRAWLER_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProfileBrawler),
    inject: ['DATA_SOURCE'],
  },
];
