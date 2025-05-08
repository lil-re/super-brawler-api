import { DataSource } from 'typeorm';
import { StarPower } from './star-power.entity';

export const starPowerProviders = [
  {
    provide: 'STAR_POWER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(StarPower),
    inject: ['DATA_SOURCE'],
  },
];
