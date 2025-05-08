import { DataSource } from 'typeorm';
import { Gear } from './gear.entity';

export const gearProviders = [
  {
    provide: 'GEAR_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Gear),
    inject: ['DATA_SOURCE'],
  },
];
