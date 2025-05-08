import { DataSource } from 'typeorm';
import { Gadget } from './gadget.entity';

export const gadgetProviders = [
  {
    provide: 'GADGET_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Gadget),
    inject: ['DATA_SOURCE'],
  },
];
