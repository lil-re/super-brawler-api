import * as process from 'node:process';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { BattlesModule } from './battles/battles.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { ConfigModule } from '@nestjs/config';
import { StatsModule } from './stats/stats.module';
import { PlayersModule } from './players/players.module';
import { EventsModule } from './events/events.module';
import { BrawlStarsModule } from './brawlstars/brawlStars.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron/cron.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    AuthModule,
    UsersModule,
    ProfilesModule,
    StatsModule,
    BattlesModule,
    EventsModule,
    PlayersModule,
    DashboardsModule,
    ConfigModule.forRoot(),
    BrawlStarsModule,
    ScheduleModule.forRoot(),
    CronModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
    }),
  ],
})
export class AppModule {}
