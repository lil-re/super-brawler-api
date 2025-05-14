import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreatePlayerDto } from './dto/create-player.dto';
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
}
