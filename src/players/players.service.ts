import { Inject, Injectable } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Repository } from 'typeorm';
import { Player } from './player.entity';

@Injectable()
export class PlayersService {
  constructor(
    @Inject('PLAYER_REPOSITORY')
    private playerRepository: Repository<Player>,
  ) {}

  async create(createPlayerDto: CreatePlayerDto) {
    const player = this.playerRepository.create({
      ...createPlayerDto,
      battle: {
        id: createPlayerDto.battleId,
      },
    });

    if (!player) {
      throw new Error(`Player could not be created`);
    }
    return this.playerRepository.save(player);
  }

  findAll() {
    return this.playerRepository.find();
  }

  async findOne(id: number) {
    const player = await this.playerRepository.findOneBy({ id });

    if (!player) {
      throw new Error(`Player with id ${id} not found`);
    }
    return player;
  }

  async findOneByTag(tag: string) {
    const player = await this.playerRepository.findOneBy({ tag });

    if (!player) {
      throw new Error(`Player with tag ${tag} not found`);
    }
    return player;
  }

  async update(id: number, updatePlayerDto: UpdatePlayerDto) {
    const player = await this.playerRepository.preload({
      id,
      ...updatePlayerDto,
    });

    if (!player) {
      throw new Error(`Player with id ${id} not found`);
    }
    return this.playerRepository.save(player);
  }

  async remove(id: number) {
    const player = await this.playerRepository.findOneBy({ id });

    if (!player) {
      throw new Error(`Player with id ${id} not found`);
    }
    await this.playerRepository.remove(player);
  }
}
