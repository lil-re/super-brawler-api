import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { eventProviders } from './event.providers';

@Module({
  imports: [DatabaseModule],
  providers: [...eventProviders],
  exports: [...eventProviders],
})
export class EventsModule {}
