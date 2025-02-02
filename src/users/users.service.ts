import * as bcrypt from 'bcrypt';
import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,

    private profilesService: ProfilesService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, language, username, tag } = createUserDto;
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    const newUser = this.userRepository.create({
      email,
      language,
      password: hash,
    });
    const user = await this.userRepository.save(newUser);
    await this.profilesService.create({
      tag,
      username,
      userId: user.id,
    });

    return user;
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    await this.userRepository.remove(user);
  }
}
