import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { starPowerProviders } from './star-power.providers';
import { StarPowersService } from './star-powers.service';

@Module({
  imports: [DatabaseModule],
  providers: [...starPowerProviders, StarPowersService],
  exports: [...starPowerProviders, StarPowersService],
})
export class StarPowersModule {}
