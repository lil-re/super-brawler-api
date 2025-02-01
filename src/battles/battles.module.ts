import { Module } from '@nestjs/common';
import { battleProviders } from './battle.providers';
import { BattlesService } from './battles.service';
import { BattlesController } from './battles.controller';
import { DatabaseModule } from '../database/database.module';
import { EventsModule } from '../events/events.module';
import { PlayersModule } from '../players/players.module';

@Module({
  imports: [DatabaseModule, EventsModule, PlayersModule],
  controllers: [BattlesController],
  providers: [...battleProviders, BattlesService],
})
export class BattlesModule {}
