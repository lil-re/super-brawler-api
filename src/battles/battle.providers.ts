import { DataSource } from 'typeorm';
import { Battle } from './entities/battle.entity';

export const battleProviders = [
  {
    provide: 'BATTLE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Battle),
    inject: ['DATA_SOURCE'],
  },
];
