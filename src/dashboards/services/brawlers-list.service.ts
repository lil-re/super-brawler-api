import { Repository, SelectQueryBuilder } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Profile } from '../../profiles/profile.entity';
import { SearchProfileBrawlerDto } from '../../profile-brawlers/dto/search-profile-brawler.dto';
import { ProfileBrawler } from '../../profile-brawlers/profile-brawler.entity';

@Injectable()
export class BrawlersListService {
  constructor(
    @Inject('PROFILE_BRAWLER_REPOSITORY')
    private profileBrawlerRepository: Repository<ProfileBrawler>,
  ) {}

  /**
   * Brawlers list
   *
   * @param profile
   * @param filters
   */
  async brawlersList(profile: Profile, filters: SearchProfileBrawlerDto) {
    const items = await this.getBrawlersListResults(profile, filters);
    const pages = await this.getBrawlersListCount(profile, filters);

    return {
      items,
      pages: Number(pages.pageCount),
    };
  }

  async getBrawlersListCount(
    profile: Profile,
    filters: SearchProfileBrawlerDto,
  ) {
    const { pageSize, search } = filters;

    let query = this.profileBrawlerRepository
      .createQueryBuilder('profileBrawler')
      .innerJoin('profileBrawler.brawler', 'brawler')
      .innerJoin('profileBrawler.profile', 'profile')
      .innerJoin('profileBrawler.profileBrawlerStats', 'profileBrawlerStat')
      .select('CEIL(COUNT(profileBrawler.id) / :pageSize)', 'pageCount')
      .setParameter('pageSize', pageSize)
      .andWhere('profile.tag = :playerTag', { playerTag: profile.tag });

    // Search brawlers
    query = this.searchBrawlersList(query, search);

    // Execute the query and return results
    return await query.getRawOne();
  }

  async getBrawlersListResults(
    profile: Profile,
    filters: SearchProfileBrawlerDto,
  ) {
    const { search, orderByValue, orderByDirection } = filters;

    // Base query
    let query = this.profileBrawlerRepository
      .createQueryBuilder('profileBrawler')
      .innerJoin('profileBrawler.brawler', 'brawler')
      .innerJoin('profileBrawler.profile', 'profile')
      .innerJoin('profileBrawler.profileBrawlerStats', 'profileBrawlerStat')
      .addSelect('brawler.label')
      .andWhere('profile.tag = :playerTag', { playerTag: profile.tag });

    // Search brawlers
    query = this.searchBrawlersList(query, search);

    // Pagination
    query = this.paginateBrawlersList(query, profile, filters);

    // Order brawlers list
    query = this.orderBrawlersListByValue(
      query,
      orderByValue,
      orderByDirection,
    );

    // Execute the query and return results
    return await query.getMany();
  }

  paginateBrawlersList(
    query: SelectQueryBuilder<ProfileBrawler>,
    profile: Profile,
    filters: SearchProfileBrawlerDto,
  ): SelectQueryBuilder<ProfileBrawler> {
    const { page, pageSize, search, orderByValue, orderByDirection } = filters;

    return query.innerJoin(
      (subQuery: SelectQueryBuilder<ProfileBrawler>) => {
        subQuery
          .select('profileBrawlerPage.id as joinedId')
          .from(ProfileBrawler, 'profileBrawlerPage')
          .innerJoin('profileBrawlerPage.brawler', 'brawler')
          .innerJoin('profileBrawlerPage.profile', 'profile')
          .innerJoin(
            'profileBrawlerPage.profileBrawlerStats',
            'profileBrawlerStat',
          )
          .andWhere('profile.tag = :playerTag', { playerTag: profile.tag });

        // Search brawlers
        subQuery = this.searchBrawlersList(subQuery, search);

        // Order brawlers list
        subQuery = this.orderBrawlersListByValue(
          subQuery,
          orderByValue,
          orderByDirection
        );

        return subQuery.limit(pageSize).offset((page - 1) * pageSize);
      },
      'profileBrawler2',
      'profileBrawler.id = profileBrawler2.joinedId',
    );
  }

  private searchBrawlersList(
    query: SelectQueryBuilder<ProfileBrawler>,
    search: string,
  ): SelectQueryBuilder<ProfileBrawler> {
    if (search && search.length > 0) {
      query.andWhere('brawler.label LIKE :search', { search: `%${search}%` });
    }

    return query;
  }

  private orderBrawlersListByValue(
    query: SelectQueryBuilder<ProfileBrawler>,
    orderByValue: string,
    orderByDirection: 'ASC' | 'DESC',
  ): SelectQueryBuilder<ProfileBrawler> {
    console.log(orderByValue, orderByDirection);
    if (orderByValue && orderByValue.length > 0 && orderByDirection) {
      if (orderByValue === 'label') {
        query.orderBy('brawler.label', orderByDirection);
      } else {
        query.orderBy(`profileBrawlerStat.${orderByValue}`, orderByDirection);
      }
    } else {
      query.orderBy('profileBrawlerStat.trophies', 'DESC');
    }

    return query;
  }
}
