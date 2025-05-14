import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProfileBrawlerStat } from './profile-brawler-stat.entity';
import { CreateProfileBrawlerStatDto } from './dto/create-profile-brawler-stat.dto';
import { UpdateProfileBrawlerStatDto } from './dto/update-profile-brawler-stat.dto';
import { ProfileBrawler } from '../profile-brawlers/profile-brawler.entity';

@Injectable()
export class ProfileBrawlerStatsService {
  constructor(
    @Inject('PROFILE_BRAWLER_STAT_REPOSITORY')
    private profileBrawlerStatRepository: Repository<ProfileBrawlerStat>,
  ) {}

  async createOrUpdate(
    profileBrawler: ProfileBrawler,
    data: CreateProfileBrawlerStatDto,
  ) {
    // Get Stat for the current day
    const currentStat = await this.profileBrawlerStatRepository
      .createQueryBuilder('profileBrawlerStat')
      .where('profileBrawlerStat.profileBrawlerId = :profileBrawlerId', {
        profileBrawlerId: profileBrawler.id,
      })
      .andWhere('DATE(createdAt) = DATE(NOW())')
      .limit(1)
      .getOne();

    // Create or update Stat
    if (currentStat?.id) {
      return this.handleUpdatedStat(currentStat.id, data);
    } else {
      return this.handleNewStat(profileBrawler.id, data);
    }
  }

  async handleNewStat(
    profileBrawlerId: number,
    data: CreateProfileBrawlerStatDto,
  ) {
    const newStat = this.profileBrawlerStatRepository.create({
      power: data.power,
      rank: data.rank,
      trophies: data.trophies,
      highestTrophies: data.highestTrophies,
      profileBrawler: {
        id: profileBrawlerId,
      },
    });

    if (!newStat) {
      throw new Error(`Profile Brawler Stat could not be created`);
    }
    return this.profileBrawlerStatRepository.save(newStat);
  }

  async handleUpdatedStat(id: number, data: UpdateProfileBrawlerStatDto) {
    const stat = await this.profileBrawlerStatRepository.preload({
      id,
      power: data.power,
      rank: data.rank,
      trophies: data.trophies,
      highestTrophies: data.highestTrophies,
    });

    if (!stat) {
      throw new Error(`Profile Brawler Stat with id ${id} not found`);
    }
    return this.profileBrawlerStatRepository.save(stat);
  }
}
