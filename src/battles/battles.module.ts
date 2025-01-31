import { Module } from '@nestjs/common';
import { BattlesService } from './battles.service';
import { BattlesController } from './battles.controller';
import { DatabaseModule } from '../database/database.module';
import { battleProviders } from './battle.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [BattlesController],
  providers: [...battleProviders, BattlesService],
})
export class BattlesModule {}
