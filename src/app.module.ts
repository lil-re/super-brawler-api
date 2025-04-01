import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BattlesModule } from './battles/battles.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { CronModule } from './cron/cron.module';
import { DashboardsModule } from './dashboards/dashboards.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    BattlesModule,
    UsersModule,
    ProfilesModule,
    AuthModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    // CronModule,
    DashboardsModule,
  ],
})
export class AppModule {}
