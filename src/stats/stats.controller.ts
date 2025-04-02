import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { CreateStatDto } from './dto/create-stat.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() creatStatDto: CreateStatDto) {
    return this.statsService.create(creatStatDto);
  }
}
