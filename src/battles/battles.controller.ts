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
import { BattlesService } from './battles.service';
import { CreateBattleDto } from './dto/create-battle.dto';
import { UpdateBattleDto } from './dto/update-battle.dto';
import { SearchBattleDto } from './dto/search-battle.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createBattleDto: CreateBattleDto) {
    return this.battlesService.create(createBattleDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.battlesService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.battlesService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Post('/search')
  search(@Body() searchBattleDto: SearchBattleDto) {
    return this.battlesService.search(searchBattleDto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBattleDto: UpdateBattleDto) {
    return this.battlesService.update(+id, updateBattleDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.battlesService.remove(+id);
  }
}
