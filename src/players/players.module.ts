import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { playerProviders } from './player.providers';

@Module({
  imports: [DatabaseModule],
  providers: [...playerProviders],
  exports: [...playerProviders],
})
export class PlayersModule {}
