import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { BattlesModule } from './battles/battles.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { ConfigModule } from '@nestjs/config';
// import { ScheduleModule } from '@nestjs/schedule';
// import { CronModule } from './cron/cron.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    AuthModule,
    UsersModule,
    ProfilesModule,
    BattlesModule,
    DashboardsModule,
    ConfigModule.forRoot(),
    // ScheduleModule.forRoot(),
    // CronModule,
  ],
})
export class AppModule {}
