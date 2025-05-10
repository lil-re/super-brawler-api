import { Inject, Injectable } from '@nestjs/common';
import { CreateProfileBrawlerDto } from './dto/create-profile-brawler.dto';
import { Repository } from 'typeorm';
import { ProfileBrawler } from './profile-brawler.entity';
import { GearsService } from '../gears/gears.service';
import { Profile } from '../profiles/profile.entity';

@Injectable()
export class ProfileBrawlersService {
  constructor(
    @Inject('PROFILE_BRAWLER_REPOSITORY')
    private profileBrawlerRepository: Repository<ProfileBrawler>,

    private gearService: GearsService,
  ) {}

  async createOrUpdate(
    profile: Profile,
    createProfileBrawlerDto: CreateProfileBrawlerDto,
  ) {
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
      await this.handleUpdatedBrawler(
        currentProfileBrawler.id,
        createProfileBrawlerDto,
      );
    } else {
      await this.handleNewProfileBrawler(profile, createProfileBrawlerDto);
    }
  }

  async handleNewProfileBrawler(
    profile: Profile,
    createProfileBrawlerDto: CreateProfileBrawlerDto,
  ): Promise<ProfileBrawler> {
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
    this.handleGears(profileBrawler, createProfileBrawlerDto);

    return profileBrawler;
  }

  async handleUpdatedBrawler(
    id: number,
    createProfileBrawlerDto: CreateProfileBrawlerDto,
  ): Promise<ProfileBrawler> {
    const profileBrawler = await this.profileBrawlerRepository.preload({
      id,
      power: createProfileBrawlerDto.power,
      rank: createProfileBrawlerDto.rank,
      trophies: createProfileBrawlerDto.trophies,
      highestTrophies: createProfileBrawlerDto.highestTrophies,
      gadgets: createProfileBrawlerDto.gadgets,
      starPowers: createProfileBrawlerDto.starPowers
    });

    if (!profileBrawler) {
      throw new Error(`Profile brawler with id ${id} not found`);
    }
    return this.profileBrawlerRepository.save(profileBrawler);
  }

  handleGears(
    profileBrawler: ProfileBrawler,
    createProfileBrawlerDto: CreateProfileBrawlerDto,
  ) {
    createProfileBrawlerDto.gears.map((createGearDto) => {
      return this.gearService.create(createGearDto, profileBrawler);
    });
  }
}
