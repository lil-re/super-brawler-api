import { Inject, Injectable } from '@nestjs/common';
import { CreateBattleDto } from './dto/create-battle.dto';
import { UpdateBattleDto } from './dto/update-battle.dto';
import { Repository } from 'typeorm';
import { Battle } from './entities/battle.entity';

@Injectable()
export class BattlesService {
  constructor(
    @Inject('BATTLE_REPOSITORY')
    private battleRepository: Repository<Battle>,
  ) {}

  async create(createBattleDto: CreateBattleDto) {
    const battle = this.battleRepository.create(createBattleDto);
    return await this.battleRepository.save(battle);
  }

  async findAll(): Promise<Battle[]> {
    return this.battleRepository.find({
      relations: ['event', 'players', 'players.brawler'],
    });
  }

  async findOne(id: number): Promise<Battle> {
    const battle = await this.battleRepository.findOneBy({ id });

    if (!battle) {
      throw new Error(`Battle with id ${id} not found`);
    }
    return battle;
  }

  async update(id: number, updateBattleDto: UpdateBattleDto): Promise<Battle> {
    const battle = await this.battleRepository.preload({
      id,
      ...updateBattleDto,
    });

    if (!battle) {
      throw new Error(`Battle with id ${id} not found`);
    }

    return this.battleRepository.save(battle);
  }

  async remove(id: number): Promise<void> {
    const battle = await this.battleRepository.findOneBy({ id });
    if (!battle) {
      throw new Error(`Battle with id ${id} not found`);
    }
    await this.battleRepository.remove(battle);
  }
}
