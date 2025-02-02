import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { playerProviders } from './player.providers';
import { PlayersService } from './players.service';

@Module({
  imports: [DatabaseModule],
  providers: [...playerProviders, PlayersService],
  exports: [...playerProviders, PlayersService],
})
export class PlayersModule {}
