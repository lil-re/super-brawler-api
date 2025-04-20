import * as bcrypt from 'bcrypt';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { SearchUserDto } from './dto/search-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, language } = createUserDto;
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    const newUser = this.userRepository.create({
      email,
      language,
      password: hash,
    });
    return await this.userRepository.save(newUser);
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
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

  async count() {
    const data = await this.userRepository
      .createQueryBuilder()
      .select('count(id) as userCount')
      .getRawOne();
    return Number(data.userCount);
  }

  /**
   * Search users
   *
   * @param filters
   */
  async search(filters: SearchUserDto) {
    const items = await this.getSearchResults(filters);
    const pages = await this.getSearchCount(filters);

    return {
      items,
      pages: Number(pages.pageCount),
    };
  }

  private async getSearchCount(filters: SearchUserDto) {
    const { pageSize, search, role } = filters;

    let query = this.userRepository
      .createQueryBuilder('user')
      .select('CEIL(COUNT(user.id) / :pageSize)', 'pageCount')
      .setParameter('pageSize', pageSize);

    // Search by email
    query = this.searchByEmail(query, search);

    // Filter by role
    query = this.filterByRole(query, role);

    // Pagination
    query = this.paginateSearch(query, filters);

    // Execute the query and return results
    return await query.getRawOne();
  }

  private async getSearchResults(filters: SearchUserDto) {
    const { search, role, orderByValue, orderByDirection } = filters;

    // Base query
    let query = this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.id')
      .addSelect('user.email')
      .addSelect('user.role')
      .addSelect('user.createdAt');

    // Search by email
    query = this.searchByEmail(query, search);

    // Filter by role
    query = this.filterByRole(query, role);

    // Pagination
    query = this.paginateSearch(query, filters);

    // Order by value
    query = this.orderByValue(query, orderByValue, orderByDirection);

    // Execute the query and return results
    return await query.getMany();
  }

  private paginateSearch(
    query: SelectQueryBuilder<User>,
    filters: SearchUserDto,
  ): SelectQueryBuilder<User> {
    const { page, pageSize, search, role, orderByValue, orderByDirection } =
      filters;

    return query.innerJoin(
      (subQuery: SelectQueryBuilder<User>) => {
        subQuery
          .select('user_page.id as joinedId')
          .from(User, 'user_page')
          .addSelect('user_page.email')
          .addSelect('user_page.role')
          .addSelect('user_page.createdAt');

        // Search by email
        subQuery = this.searchByEmail(subQuery, search);

        // Filter by role
        subQuery = this.filterByRole(subQuery, role);

        // Order by value
        subQuery = this.orderByValue(
          subQuery,
          orderByValue,
          orderByDirection,
          'user_page',
        );

        return subQuery.limit(pageSize).offset((page - 1) * pageSize);
      },
      'user2',
      'user.id = user2.joinedId',
    );
  }

  private searchByEmail(
    query: SelectQueryBuilder<User>,
    search: string,
  ): SelectQueryBuilder<User> {
    if (search && search.length > 0) {
      query.andWhere('email LIKE :search', { search: `%${search}%` });
    }

    return query;
  }

  private filterByRole(
    query: SelectQueryBuilder<User>,
    role: string,
  ): SelectQueryBuilder<User> {
    if (role && role.length > 0) {
      query.andWhere('role = :role', { role });
    }

    return query;
  }

  private orderByValue(
    query: SelectQueryBuilder<User>,
    orderByValue: string,
    orderByDirection: 'ASC' | 'DESC',
    alias: string = 'user',
  ): SelectQueryBuilder<User> {
    if (orderByValue && orderByValue.length > 0 && orderByDirection) {
      query.orderBy(`${alias}.${orderByValue}`, orderByDirection);
    } else {
      query.orderBy(`${alias}.email`, 'DESC');
    }

    return query;
  }
}
