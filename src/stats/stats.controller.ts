import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards, Request,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { CreateStatDto } from './dto/create-stat.dto';
import { UpdateStatDto } from './dto/update-stat.dto';
import { ProfileGuard } from '../auth/profile.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(ProfileGuard)
  @Post()
  create(@Body() creatStatDto: CreateStatDto) {
    return this.statsService.create(creatStatDto);
  }

  @UseGuards(ProfileGuard)
  @Get()
  findAll() {
    return this.statsService.findAll();
  }

  @UseGuards(ProfileGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.statsService.findOne(+id);
  }

  @UseGuards(ProfileGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStatDto: UpdateStatDto) {
    return this.statsService.update(+id, updateStatDto);
  }

  @UseGuards(ProfileGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.statsService.remove(+id);
  }
}
