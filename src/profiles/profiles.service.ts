import { Inject, Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ProfilesService {
  constructor(
    @Inject('PROFILE_REPOSITORY')
    private profileRepository: Repository<Profile>,

    @InjectQueue('cron') private cronQueue: Queue,
  ) {}

  async create(createProfileDto: CreateProfileDto) {
    const profile = this.profileRepository.create(createProfileDto);

    if (!profile) {
      throw new Error(`Profile could not be created`);
    }

    await this.cronQueue.add('add-stats', { profile });
    await this.cronQueue.add('add-battles', { profile });
    return this.profileRepository.save(profile);
  }

  findAll() {
    return this.profileRepository.find();
  }

  async findOne(id: string) {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new Error(`Profile with id ${id} not found`);
    }
    return profile;
  }

  async findOneByTag(tag: string) {
    const profile = await this.profileRepository.findOneBy({
      tag: tag.includes('#') ? tag : `#${tag}`
    });

    if (!profile) {
      throw new Error(`Player with tag ${tag} not found`);
    }
    return profile;
  }

  async findOneByIdAndTag(id: string, tag: string) {
    const profile = await this.profileRepository.findOneBy({ id, tag });

    if (!profile) {
      throw new Error(`Player with tag ${tag} not found`);
    }
    return profile;
  }

  async update(id: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.profileRepository.preload({
      id,
      ...updateProfileDto,
    });

    if (!profile) {
      throw new Error(`Profile with id ${id} not found`);
    }
    return this.profileRepository.save(profile);
  }

  async remove(id: string) {
    const profile = await this.profileRepository.findOneBy({ id });

    if (!profile) {
      throw new Error(`Profile with id ${id} not found`);
    }
    await this.profileRepository.remove(profile);
    return true;
  }
}
