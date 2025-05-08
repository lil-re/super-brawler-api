import { Inject, Injectable } from '@nestjs/common';
import { CreateStarPowerDto } from './dto/create-star-power.dto';
import { Repository } from 'typeorm';
import { StarPower } from './star-power.entity';
import { Brawler } from '../brawlers/brawler.entity';

@Injectable()
export class StarPowersService {
  constructor(
    @Inject('STAR_POWER_REPOSITORY')
    private starPowerRepository: Repository<StarPower>,
  ) {}

  async create(createStarPowerDto: CreateStarPowerDto, brawler: Brawler) {
    const newStarPower = this.starPowerRepository.create({
      id: createStarPowerDto.id,
      label: createStarPowerDto.name,
      brawler,
    });

    if (!newStarPower) {
      throw new Error(`StarPower could not be created`);
    }
    return this.starPowerRepository.save(newStarPower);
  }
}
