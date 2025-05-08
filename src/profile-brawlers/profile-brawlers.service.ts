import { Inject, Injectable } from '@nestjs/common';
import { CreateProfileBrawlerDto } from './dto/create-profile-brawler.dto';
import { Repository } from 'typeorm';
import { ProfileBrawler } from './profile-brawler.entity';
import { Brawler } from '../brawlers/brawler.entity';
import { CreateBrawlerDto } from '../brawlers/dto/create-brawler.dto';
import { CreateGearDto } from '../gears/dto/create-gear.dto';
import { GearsService } from '../gears/gears.service';
import { Profile } from '../profiles/profile.entity';

@Injectable()
export class ProfileBrawlersService {
  constructor(
    @Inject('PROFILE_BRAWLER_REPOSITORY')
    private profileBrawlerRepository: Repository<ProfileBrawler>,

    private gearService: GearsService,
  ) {}

  async create(createProfileBrawlerDto: CreateProfileBrawlerDto, profile: Profile) {
    const currentProfileBrawler = await this.profileBrawlerRepository.findOneBy(
      {
        brawler: {
          id: createProfileBrawlerDto.id,
        },
        profile: {
          id: profile.id,
        },
      },
    );

    if (currentProfileBrawler) {
      throw new Error(
        `Brawler with ID "${currentProfileBrawler.id}" already linked to profile with tag "${profile.tag}"`,
      );
    }

    const newProfileBrawler: ProfileBrawler =
      this.profileBrawlerRepository.create({
        power: createProfileBrawlerDto.power,
        rank: createProfileBrawlerDto.rank,
        trophies: createProfileBrawlerDto.trophies,
        highestTrophies: createProfileBrawlerDto.highestTrophies,
        gadgets: createProfileBrawlerDto.gadgets,
        starPowers: createProfileBrawlerDto.starPowers,
        brawler: {
          id: createProfileBrawlerDto.id,
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
    this.handleGears(createProfileBrawlerDto, profileBrawler);

    return profileBrawler;
  }

  handleGears(
    createProfileBrawlerDto: CreateProfileBrawlerDto,
    profileBrawler: ProfileBrawler,
  ) {
    createProfileBrawlerDto.gears.map((createGearDto) => {
      return this.gearService.create(createGearDto, profileBrawler);
    });
  }
}
