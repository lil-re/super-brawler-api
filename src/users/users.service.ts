import * as bcrypt from 'bcrypt';
import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Battle } from '../battles/battle.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { BrawlStarsService } from '../brawlstars/brawlStars.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,

    @Inject('BATTLE_REPOSITORY')
    private battleRepository: Repository<Battle>,

    private profilesService: ProfilesService,

    private brawlStarsService: BrawlStarsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, language, username, tag } = createUserDto;
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    const isAdmin = await this.handleAdminUser();
    const newUser = this.userRepository.create({
      email,
      language,
      password: hash,
      isAdmin,
    });
    const user = await this.userRepository.save(newUser);

    if (!isAdmin) {
      const profile = await this.profilesService.create({
        tag,
        username,
        userId: user.id,
      });
      await this.brawlStarsService.handleProfileStats(profile.id);
      await this.brawlStarsService.handleProfileBattles(profile.id);
    }

    return user;
  }

  async handleAdminUser() {
    const data = await this.userRepository
      .createQueryBuilder()
      .select('count(id) as userCount')
      .getRawOne();

    return data.userCount === '0';
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    // Get user with its profile
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profiles'],
    });

    const brawlers = {};

    // For each profile, get the associated brawlers
    for (const profile of user.profiles) {
      const list = await this.findAllBrawlersByProfile(profile.id);
      brawlers[profile.id] = list;
    }

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return { user, brawlers };
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    return user;
  }

  async findAllEventModesByProfile(profileId: string) {
    const data = await this.battleRepository
      .createQueryBuilder('battle')
      .select(['event.mode'])
      .innerJoin('battle.event', 'event')
      .where('battle.profileId = :profileId', { profileId })
      .groupBy('event.mode')
      .distinct(true)
      .getRawMany();
    return data.map((item) => item.event_mode);
  }

  async findAllEventMapsByProfile(profileId: string) {
    const data = await this.battleRepository
      .createQueryBuilder('battle')
      .select(['event.map'])
      .innerJoin('battle.event', 'event')
      .where('battle.profileId = :profileId', { profileId })
      .groupBy('event.map')
      .distinct(true)
      .getRawMany();
    return data.map((item) => item.event_map);
  }

  async findAllBrawlersByProfile(profileId: string) {
    const data = await this.battleRepository
      .createQueryBuilder('battle')
      .select(['player.brawlerName'])
      .innerJoin('battle.players', 'player')
      .where('battle.profileId = :profileId', { profileId })
      .groupBy('player.brawlerName')
      .distinct(true)
      .getRawMany();
    return data.map((item) => item.player_brawlerName);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return this.userRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    await this.userRepository.remove(user);
  }
}
