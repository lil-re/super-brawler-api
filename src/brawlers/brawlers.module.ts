import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { brawlerProviders } from './brawler.providers';
import { BrawlersService } from './brawlers.service';
import { GadgetsModule } from '../gadgets/gadgets.module';
import { StarPowersModule } from '../star-powers/star-powers.module';

@Module({
  imports: [DatabaseModule, GadgetsModule, StarPowersModule],
  providers: [...brawlerProviders, BrawlersService],
  exports: [...brawlerProviders, BrawlersService],
})
export class BrawlersModule {}
