import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { gearProviders } from './gear.providers';
import { GearsService } from './gears.service';

@Module({
  imports: [DatabaseModule],
  providers: [...gearProviders, GearsService],
  exports: [...gearProviders, GearsService],
})
export class GearsModule {}
