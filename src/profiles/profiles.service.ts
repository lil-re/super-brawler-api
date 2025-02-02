import { Inject, Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @Inject('PROFILE_REPOSITORY')
    private profileRepository: Repository<Profile>,
  ) {}

  async create(createProfileDto: CreateProfileDto) {
    const profile = this.profileRepository.create({
      ...createProfileDto,
      user: {
        id: createProfileDto.userId,
      },
    });

    if (!profile) {
      throw new Error(`Profile could not be created`);
    }
    return this.profileRepository.save(profile);
  }

  findAll() {
    return this.profileRepository.find();
  }

  async findOne(id: number) {
    const profile = await this.profileRepository.findOneBy({ id });

    if (!profile) {
      throw new Error(`Profile with id ${id} not found`);
    }
    return profile;
  }

  async findOneByTag(tag: string) {
    const profile = await this.profileRepository.findOneBy({ tag });

    if (!profile) {
      throw new Error(`Player with tag ${tag} not found`);
    }
    return profile;
  }

  async update(id: number, updateProfileDto: UpdateProfileDto) {
    const profile = await this.profileRepository.preload({
      id,
      ...updateProfileDto,
    });

    if (!profile) {
      throw new Error(`Profile with id ${id} not found`);
    }
    return this.profileRepository.save(profile);
  }

  async remove(id: number) {
    const profile = await this.profileRepository.findOneBy({ id });

    if (!profile) {
      throw new Error(`Profile with id ${id} not found`);
    }
    await this.profileRepository.remove(profile);
  }
}
