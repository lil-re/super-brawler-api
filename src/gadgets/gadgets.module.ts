import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { gadgetProviders } from './gadget.providers';
import { GadgetsService } from './gadgets.service';

@Module({
  imports: [DatabaseModule],
  providers: [...gadgetProviders, GadgetsService],
  exports: [...gadgetProviders, GadgetsService],
})
export class GadgetsModule {}
