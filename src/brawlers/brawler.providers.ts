import { DataSource } from 'typeorm';
import { Brawler } from './brawler.entity';

export const brawlerProviders = [
  {
    provide: 'BRAWLER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Brawler),
    inject: ['DATA_SOURCE'],
  },
];
