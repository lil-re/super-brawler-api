import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Stat } from './stat.entity';
import { CreateStatDto } from './dto/create-stat.dto';
import { ProfilesService } from '../profiles/profiles.service';
import { Profile } from '../profiles/profile.entity';
import { UpdateStatDto } from './dto/update-stat.dto';

@Injectable()
export class StatsService {
  constructor(
    @Inject('STAT_REPOSITORY')
    private statRepository: Repository<Stat>,
  ) {}

  async createOrUpdate(profile: Profile, createStatDto: CreateStatDto) {
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

  async handleNewStat(profileId: string, data: CreateStatDto) {
    const newStat = this.statRepository.create({
      trophies: data.trophies,
      highestTrophies: data.highestTrophies,
      expLevel: data.expLevel,
      expPoints: data.expPoints,
      trioVictories: data.trioVictories,
      duoVictories: data.duoVictories,
      soloVictories: data.soloVictories,
      bestRoboRumbleTime: data.bestRoboRumbleTime,
      bestTimeAsBigBrawler: data.bestTimeAsBigBrawler,
      profile: {
        id: profileId,
      },
    });

    if (!newStat) {
      throw new Error(`Stat could not be created`);
    }
    return this.statRepository.save(newStat);
  }

  async handleUpdatedStat(id: number, data: UpdateStatDto) {
    const stat = await this.statRepository.preload({
      id,
      trophies: data.trophies,
      highestTrophies: data.highestTrophies,
      expLevel: data.expLevel,
      expPoints: data.expPoints,
      trioVictories: data.trioVictories,
      duoVictories: data.duoVictories,
      soloVictories: data.soloVictories,
      bestRoboRumbleTime: data.bestRoboRumbleTime,
      bestTimeAsBigBrawler: data.bestTimeAsBigBrawler,
    });

    if (!stat) {
      throw new Error(`Stat with id ${id} not found`);
    }
    return this.statRepository.save(stat);
  }
}
