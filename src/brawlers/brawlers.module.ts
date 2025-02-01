import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { brawlerProviders } from './brawler.providers';

@Module({
  imports: [DatabaseModule],
  providers: [...brawlerProviders],
  exports: [...brawlerProviders],
})
export class BrawlersModule {}
