import { Module } from '@nestjs/common';
import { userProviders } from './user.providers';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../database/database.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { EventsModule } from '../events/events.module';
import { PlayersModule } from '../players/players.module';
import { BattlesModule } from '../battles/battles.module';
import { BrawlStarsModule } from '../brawlstars/brawlStars.module';

@Module({
  imports: [
    DatabaseModule,
    ProfilesModule,
    BattlesModule,
    EventsModule,
    PlayersModule,
    BrawlStarsModule
  ],
  controllers: [UsersController],
  providers: [...userProviders, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
