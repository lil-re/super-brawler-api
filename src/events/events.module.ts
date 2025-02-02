import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { eventProviders } from './event.providers';
import { EventsService } from './events.service';

@Module({
  imports: [DatabaseModule],
  providers: [...eventProviders, EventsService],
  exports: [...eventProviders, EventsService],
})
export class EventsModule {}
