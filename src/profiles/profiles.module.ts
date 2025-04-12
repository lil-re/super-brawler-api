import { Module } from '@nestjs/common';
import { profileProviders } from './profile.providers';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { DatabaseModule } from '../database/database.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: 'cron',
    }),
  ],
  controllers: [ProfilesController],
  providers: [...profileProviders, ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
