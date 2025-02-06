import { DataSource } from 'typeorm';
import { Stat } from './stat.entity';

export const statProviders = [
  {
    provide: 'STAT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Stat),
    inject: ['DATA_SOURCE'],
  },
];
