import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BattlesModule } from './battles/battles.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [BattlesModule],
})
export class AppModule {}
