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
import { BattlesService } from './battles.service';
import { CreateBattleDto } from './dto/create-battle.dto';
import { UpdateBattleDto } from './dto/update-battle.dto';
import { ProfileGuard } from '../auth/profile.guard';
import { AuthGuard } from '../auth/auth.guard';

@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createBattleDto: CreateBattleDto) {
    return this.battlesService.create(createBattleDto);
  }

  @UseGuards(ProfileGuard)
  @Get()
  findAll() {
    return this.battlesService.findAll();
  }

  @UseGuards(ProfileGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.battlesService.findOne(+id);
  }

  @UseGuards(ProfileGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBattleDto: UpdateBattleDto) {
    return this.battlesService.update(+id, updateBattleDto);
  }

  @UseGuards(ProfileGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.battlesService.remove(+id);
  }
}
