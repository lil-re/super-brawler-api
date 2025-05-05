import { Queue } from 'bullmq';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SearchProfileDto } from './dto/search-profile.dto';
import { Profile, ProfileStatus } from './profile.entity';

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

  findAllActive() {
    return this.profileRepository.find({
      where: {
        status: ProfileStatus.ACTIVE,
      },
    });
  }

  async findOne(id: string) {
    const profile = await this.profileRepository.findOneBy({ id });

    if (!profile) {
      throw new Error(`Profile with id ${id} not found`);
    }
    return profile;
  }

  async findOneByTag(tag: string) {
    const profile = await this.profileRepository.findOneBy({
      tag: tag.includes('#') ? tag : `#${tag}`,
    });

    // if (!profile) {
    //   throw new Error(`Player with tag ${tag} not found`);
    // }
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

  /**
   * Search profiles
   *
   * @param filters
   */
  async search(filters: SearchProfileDto) {
    const items = await this.getSearchResults(filters);
    const pages = await this.getSearchCount(filters);

    return {
      items,
      pages: Number(pages.pageCount),
    };
  }

  private async getSearchCount(filters: SearchProfileDto) {
    const { pageSize, search, status } = filters;

    let query = this.profileRepository
      .createQueryBuilder('profile')
      .select('CEIL(COUNT(profile.id) / :pageSize)', 'pageCount')
      .setParameter('pageSize', pageSize);

    // Search by tag
    query = this.searchByEmail(query, search);

    // Filter by status
    query = this.filterByRole(query, status);

    // Pagination
    query = this.paginateSearch(query, filters);

    // Execute the query and return results
    return await query.getRawOne();
  }

  private async getSearchResults(filters: SearchProfileDto) {
    const { search, status, orderByValue, orderByDirection } = filters;

    // Base query
    let query = this.profileRepository
      .createQueryBuilder('profile')
      .addSelect('profile.id')
      .addSelect('profile.tag')
      .addSelect('profile.username')
      .addSelect('profile.status')
      .addSelect('profile.createdAt');

    // Search by tag
    query = this.searchByEmail(query, search);

    // Filter by status
    query = this.filterByRole(query, status);

    // Pagination
    query = this.paginateSearch(query, filters);

    // Order by value
    query = this.orderByValue(query, orderByValue, orderByDirection);

    // Execute the query and return results
    return await query.getMany();
  }

  private paginateSearch(
    query: SelectQueryBuilder<Profile>,
    filters: SearchProfileDto,
  ): SelectQueryBuilder<Profile> {
    const { page, pageSize, search, status, orderByValue, orderByDirection } =
      filters;

    return query.innerJoin(
      (subQuery: SelectQueryBuilder<Profile>) => {
        subQuery
          .select('profile_page.id as joinedId')
          .from(Profile, 'profile_page')
          .addSelect('profile_page.tag')
          .addSelect('profile_page.username')
          .addSelect('profile_page.status')
          .addSelect('profile_page.createdAt');

        // Search by tag
        subQuery = this.searchByEmail(subQuery, search);

        // Filter by status
        subQuery = this.filterByRole(subQuery, status);

        // Order by value
        subQuery = this.orderByValue(
          subQuery,
          orderByValue,
          orderByDirection,
          'profile_page',
        );

        return subQuery.limit(pageSize).offset((page - 1) * pageSize);
      },
      'profile2',
      'profile.id = profile2.joinedId',
    );
  }

  private searchByEmail(
    query: SelectQueryBuilder<Profile>,
    search: string,
  ): SelectQueryBuilder<Profile> {
    if (search && search.length > 0) {
      query.andWhere('tag LIKE :search', { search: `%${search}%` });
    }

    return query;
  }

  private filterByRole(
    query: SelectQueryBuilder<Profile>,
    status: string,
  ): SelectQueryBuilder<Profile> {
    if (status && status.length > 0) {
      query.andWhere('status = :status', { status });
    }

    return query;
  }

  private orderByValue(
    query: SelectQueryBuilder<Profile>,
    orderByValue: string,
    orderByDirection: 'ASC' | 'DESC',
    alias: string = 'profile',
  ): SelectQueryBuilder<Profile> {
    if (orderByValue && orderByValue.length > 0 && orderByDirection) {
      query.orderBy(`${alias}.${orderByValue}`, orderByDirection);
    } else {
      query.orderBy(`${alias}.tag`, 'DESC');
    }

    return query;
  }
}
