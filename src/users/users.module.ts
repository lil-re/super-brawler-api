import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { userProviders } from './user.providers';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../database/database.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { EventsModule } from '../events/events.module';
import { PlayersModule } from '../players/players.module';
import { BattlesModule } from '../battles/battles.module';
import { BrawlStarsModule } from '../brawl-stars/brawl-stars.module';
import { CronModule } from '../cron/cron.module';

@Module({
  imports: [
    DatabaseModule,
    ProfilesModule,
    BattlesModule,
    EventsModule,
    PlayersModule,
    BrawlStarsModule,
    CronModule,
    BullModule.registerQueue({
      name: 'cron',
    }),
  ],
  controllers: [UsersController],
  providers: [...userProviders, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
