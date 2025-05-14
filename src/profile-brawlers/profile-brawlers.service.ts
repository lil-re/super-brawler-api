import { Inject, Injectable } from '@nestjs/common';
import { CreateProfileBrawlerDto } from './dto/create-profile-brawler.dto';
import { Repository } from 'typeorm';
import { ProfileBrawler } from './profile-brawler.entity';
import { GearsService } from '../gears/gears.service';
import { Profile } from '../profiles/profile.entity';
import { UpdateProfileBrawlerDto } from './dto/update-profile-brawler.dto';
import { ProfileBrawlerStatsService } from '../profile-brawler-stats/profile-brawler-stats.service';

@Injectable()
export class ProfileBrawlersService {
  constructor(
    @Inject('PROFILE_BRAWLER_REPOSITORY')
    private profileBrawlerRepository: Repository<ProfileBrawler>,

    private profileBrawlerStatService: ProfileBrawlerStatsService,

    private gearService: GearsService,
  ) {}

  async createOrUpdate(profile: Profile, data: CreateProfileBrawlerDto) {
    const currentProfileBrawler = await this.profileBrawlerRepository.findOneBy(
      {
        brawler: {
          id: data.id,
        },
        profile: {
          id: profile.id,
        },
      },
    );

    if (currentProfileBrawler) {
      await this.handleUpdatedBrawler(currentProfileBrawler.id, data);
    } else {
      await this.handleNewProfileBrawler(profile, data);
    }
  }

  async handleNewProfileBrawler(
    profile: Profile,
    data: CreateProfileBrawlerDto,
  ): Promise<ProfileBrawler> {
    const newProfileBrawler: ProfileBrawler =
      this.profileBrawlerRepository.create({
        gadgets: data.gadgets,
        starPowers: data.starPowers,
        brawler: {
          id: data.id,
        },
        profile: {
          id: profile.id,
        },
      });

    if (!newProfileBrawler) {
      throw new Error(`ProfileBrawler could not be created`);
    }

    const profileBrawler =
      await this.profileBrawlerRepository.save(newProfileBrawler);
    await this.handleProfileBrawlerStats(profileBrawler, data);
    await this.handleGears(profileBrawler, data);

    return profileBrawler;
  }

  async handleUpdatedBrawler(
    id: number,
    data: UpdateProfileBrawlerDto,
  ): Promise<ProfileBrawler> {
    const newProfileBrawler = await this.profileBrawlerRepository.preload({
      id,
      gadgets: data.gadgets,
      starPowers: data.starPowers,
    });

    if (!newProfileBrawler) {
      throw new Error(`Profile brawler with id ${id} not found`);
    }

    const profileBrawler =
      await this.profileBrawlerRepository.save(newProfileBrawler);
    await this.handleProfileBrawlerStats(profileBrawler, data);

    return profileBrawler;
  }

  async handleGears(
    profileBrawler: ProfileBrawler,
    data: CreateProfileBrawlerDto,
  ) {
    for (const gear of data.gears) {
      await this.gearService.create(profileBrawler, gear);
    }
  }

  async handleProfileBrawlerStats(
    profileBrawler: ProfileBrawler,
    data: CreateProfileBrawlerDto | UpdateProfileBrawlerDto,
  ) {
    await this.profileBrawlerStatService.createOrUpdate(profileBrawler, {
      rank: data.rank,
      power: data.power,
      trophies: data.trophies,
      highestTrophies: data.highestTrophies,
    });
  }
}
