import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { CreateStatDto } from './dto/create-stat.dto';
import { UpdateStatDto } from './dto/update-stat.dto';
import { AuthGuard } from '../auth/auth.guard';
import { FilterStatDto } from './dto/filter-stat.dto';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() creatStatDto: CreateStatDto) {
    return this.statsService.create(creatStatDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.statsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.statsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Post('/dashboard')
  dashboard(@Body() filterStatDto: FilterStatDto) {
    return this.statsService.dashboard(filterStatDto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStatDto: UpdateStatDto) {
    return this.statsService.update(+id, updateStatDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.statsService.remove(+id);
  }
}
