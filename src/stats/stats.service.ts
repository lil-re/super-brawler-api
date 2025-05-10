import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Stat } from './stat.entity';
import { CreateStatDto } from './dto/create-stat.dto';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class StatsService {
  constructor(
    @Inject('STAT_REPOSITORY')
    private statRepository: Repository<Stat>,

    private profilesService: ProfilesService,
  ) {}

  async createOrUpdate(createStatDto: CreateStatDto) {
    // Handle Profile
    const profile = await this.profilesService.findOneByIdAndTag(
      createStatDto.profileId,
      createStatDto.tag,
    );

    // Get Stat for the current day
    const currentStat = await this.statRepository
      .createQueryBuilder('stat')
      .where('stat.profileId = :profileId', { profileId: profile.id })
      .andWhere('DATE(createdAt) = DATE(NOW())')
      .limit(1)
      .getOne();

    // Create or update Stat
    if (currentStat?.id) {
      return this.handleUpdatedStat(currentStat.id, createStatDto);
    } else {
      return this.handleNewStat(profile.id, createStatDto);
    }
  }

  async handleNewStat(profileId: string, createStatDto: CreateStatDto) {
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
        id: profileId,
      },
    });

    if (!newStat) {
      throw new Error(`Stat could not be created`);
    }
    return this.statRepository.save(newStat);
  }

  async handleUpdatedStat(id: number, createStatDto: CreateStatDto) {
    const stat = await this.statRepository.preload({
      id,
      trophies: createStatDto.trophies,
      highestTrophies: createStatDto.highestTrophies,
      expLevel: createStatDto.expLevel,
      expPoints: createStatDto.expPoints,
      trioVictories: createStatDto.trioVictories,
      duoVictories: createStatDto.duoVictories,
      soloVictories: createStatDto.soloVictories,
      bestRoboRumbleTime: createStatDto.bestRoboRumbleTime,
      bestTimeAsBigBrawler: createStatDto.bestTimeAsBigBrawler,
    });

    if (!stat) {
      throw new Error(`Stat with id ${id} not found`);
    }
    return this.statRepository.save(stat);
  }
}
