import { Inject, Injectable } from '@nestjs/common';
import { CreateStatDto } from './dto/create-stat.dto';
import { UpdateStatDto } from './dto/update-stat.dto';
import { Repository } from 'typeorm';
import { Stat } from './stat.entity';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class StatsService {
  constructor(
    @Inject('STAT_REPOSITORY')
    private statRepository: Repository<Stat>,

    private profilesService: ProfilesService,
  ) {}

  async create(createStatDto: CreateStatDto) {
    // Handle Profile
    const profile = await this.profilesService.findOneByTag(createStatDto.tag);

    // Handle new stat
    const newStat = this.statRepository.create({
      trophies: createStatDto.trophies,
      highestTrophies: createStatDto.highestTrophies,
      expLevel: createStatDto.expLevel,
      expPoints: createStatDto.expPoints,
      trioVictories: createStatDto.trioVictories,
      duoVictories: createStatDto.duoVictories,
      soloVictories: createStatDto.soloVictories,
      bestRoboRumbleTime: createStatDto.bestRoboRumbleTime,
      bestTimeAsBigBrawler: createStatDto.bestTimeAsBigBrawler,
      profile: {
        id: profile.id,
      },
    });

    if (!newStat) {
      throw new Error(`Stat could not be created`);
    }
    return this.statRepository.save(newStat);
  }

  findAll() {
    return this.statRepository.find();
  }

  async findOne(id: number) {
    const stat = await this.statRepository.findOneBy({ id });

    if (!stat) {
      throw new Error(`Stat with id ${id} not found`);
    }
    return stat;
  }

  async update(id: number, updateStatDto: UpdateStatDto) {
    const stat = await this.statRepository.preload({
      id,
      ...updateStatDto,
    });

    if (!stat) {
      throw new Error(`Stat with id ${id} not found`);
    }
    return this.statRepository.save(stat);
  }

  async remove(id: number) {
    const stat = await this.statRepository.findOneBy({ id });

    if (!stat) {
      throw new Error(`Stat with id ${id} not found`);
    }
    await this.statRepository.remove(stat);
  }
}
