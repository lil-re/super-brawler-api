import { Inject, Injectable } from '@nestjs/common';
import { CreateGearDto } from './dto/create-gear.dto';
import { Repository } from 'typeorm';
import { Gear } from './gear.entity';
import { Brawler } from '../brawlers/brawler.entity';
import { ProfileBrawler } from '../profile-brawlers/profile-brawler.entity';

@Injectable()
export class GearsService {
  constructor(
    @Inject('GEAR_REPOSITORY')
    private gearRepository: Repository<Gear>,
  ) {}

  async create(profileBrawler: ProfileBrawler, data: CreateGearDto) {
    const newGear = this.gearRepository.create({
      id: data.id,
      label: data.name,
      profileBrawler,
    });

    if (!newGear) {
      throw new Error(`Gear could not be created`);
    }
    return this.gearRepository.save(newGear);
  }
}
