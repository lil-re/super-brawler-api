import { Module } from '@nestjs/common';
import { battleProviders } from './battle.providers';
import { BattlesService } from './battles.service';
import { DatabaseModule } from '../database/database.module';
import { EventsModule } from '../events/events.module';
import { PlayersModule } from '../players/players.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [DatabaseModule, ProfilesModule, EventsModule, PlayersModule],
  providers: [...battleProviders, BattlesService],
  exports: [...battleProviders, BattlesService],
})
export class BattlesModule {}
