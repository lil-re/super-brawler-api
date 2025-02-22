import { Inject, Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { Battle } from './battle.entity';
import { Event } from '../events/event.entity';
import { Profile } from '../profiles/profile.entity';
import { EventsService } from '../events/events.service';
import { PlayersService } from '../players/players.service';
import { ProfilesService } from '../profiles/profiles.service';
import { UpdateBattleDto } from './dto/update-battle.dto';
import { CreateBattleDto } from './dto/create-battle.dto';
import { SearchBattleDto } from './dto/search-battle.dto';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class BattlesService {
  constructor(
    @Inject('BATTLE_REPOSITORY')
    private battleRepository: Repository<Battle>,

    private eventsService: EventsService,

    private playersService: PlayersService,

    private profilesService: ProfilesService,
  ) {}

  async create(createBattleDto: CreateBattleDto) {
    // Handle Profile
    const profile = await this.profilesService.findOneByTag(
      createBattleDto.profileTag,
    );

    // Handle Event
    const event = await this.handleNewEvent(createBattleDto);

    // Handle Battle
    const battle = await this.handleNewBattle(createBattleDto, profile, event);

    // Handle Players
    await this.handleNewPlayers(createBattleDto, battle);

    return battle;
  }

  async findAll(): Promise<Battle[]> {
    return this.battleRepository.find({
      relations: ['event', 'players'],
    });
  }

  async findOne(id: number): Promise<Battle> {
    const battle = await this.battleRepository.findOneBy({ id });

    if (!battle) {
      throw new Error(`Battle with id ${id} not found`);
    }
    return battle;
  }

  async update(id: number, updateBattleDto: UpdateBattleDto): Promise<Battle> {
    const battle = await this.battleRepository.preload({
      id,
      ...updateBattleDto,
    });

    if (!battle) {
      throw new Error(`Battle with id ${id} not found`);
    }
    return this.battleRepository.save(battle);
  }

  async remove(id: number): Promise<void> {
    const battle = await this.battleRepository.findOneBy({ id });

    if (!battle) {
      throw new Error(`Battle with id ${id} not found`);
    }
    await this.battleRepository.remove(battle);
  }

  private async handleNewEvent(createBattleDto: CreateBattleDto) {
    if (createBattleDto?.event?.id) {
      return this.eventsService.create({
        eventId: createBattleDto.event.id,
        mode: createBattleDto.event.mode,
        map: createBattleDto.event.map,
      });
    } else {
      return this.eventsService.create({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        eventId: EventsService.COMMUNITY_ID,
        mode: createBattleDto.battle.mode,
        map: EventsService.COMMUNITY_MAP,
      });
    }
  }

  private async handleNewBattle(
    createBattleDto: CreateBattleDto,
    profile: Profile,
    event: Event,
  ) {
    const battle = await this.battleRepository.findOneBy({
      profile,
      battleTime: this.parseDate(createBattleDto.battleTime),
    });

    if (battle) {
      throw new Error(`Battle has already been stored`);
    }

    const newBattle = this.battleRepository.create({
      starPlayerTag: createBattleDto.battle?.starPlayer?.tag,
      battleTime: this.parseDate(createBattleDto.battleTime),
      duration: createBattleDto.battle.duration,
      result: createBattleDto.battle.result,
      rank: createBattleDto.battle.rank,
      trophyChange: createBattleDto.battle.trophyChange,
      type: createBattleDto.battle.type,
      profile: {
        id: profile.id,
      },
      event: {
        id: event.id,
      },
    });

    if (!newBattle) {
      throw new Error(`Battle could not be created`);
    }
    return this.battleRepository.save(newBattle);
  }

  private async handleNewPlayers(
    createBattleDto: CreateBattleDto,
    battle: Battle,
  ) {
    if (createBattleDto.battle.teams) {
      await this.handleNewTeamPlayers(createBattleDto, battle);
    } else {
      await this.handleNewSoloPlayers(createBattleDto, battle);
    }
  }

  private async handleNewTeamPlayers(
    createBattleDto: CreateBattleDto,
    battle: Battle,
  ) {
    for (let i = 0; i < createBattleDto.battle.teams.length; i++) {
      const createBattleTeamDto = createBattleDto.battle.teams[i];

      for (const createBattlePlayerDto of createBattleTeamDto) {
        await this.playersService.create({
          tag: createBattlePlayerDto.tag,
          name: createBattlePlayerDto.name,
          brawlerId: createBattlePlayerDto.brawler.id,
          brawlerName: createBattlePlayerDto.brawler.name,
          power: createBattlePlayerDto.brawler.power,
          trophies: createBattlePlayerDto.brawler.trophies,
          battleId: battle.id,
          team: i + 1,
        });
      }
    }
  }

  private async handleNewSoloPlayers(
    createBattleDto: CreateBattleDto,
    battle: Battle,
  ) {
    for (const createBattlePlayerDto of createBattleDto.battle.players) {
      await this.playersService.create({
        tag: createBattlePlayerDto.tag,
        name: createBattlePlayerDto.name,
        brawlerId: createBattlePlayerDto.brawler.id,
        brawlerName: createBattlePlayerDto.brawler.name,
        power: createBattlePlayerDto.brawler.power,
        trophies: createBattlePlayerDto.brawler.trophies,
        battleId: battle.id,
      });
    }
  }

  parseDate(value: string): Date {
    const regex = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.(\d{3})Z$/;
    const match = value.match(regex);

    if (!match) {
      throw new Error('Invalid date format');
    }

    const formattedDate = `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}.${match[7]}Z`;
    return new Date(formattedDate);
  }

  async search(profile, filters: SearchBattleDto) {
    const items = await this.getSearchResults(profile, filters);
    const pages = await this.getSearchCount(profile, filters);

    return {
      items,
      pages: Number(pages.pageCount),
    }
  }

  async getSearchCount(profile, filters: SearchBattleDto) {
    const { pageSize, date, dateRange, eventId, brawlerName } = filters;

    let query = this.battleRepository
      .createQueryBuilder('battle')
      .innerJoin('battle.event', 'event')
      .innerJoin('battle.players', 'player')
      .select('CEIL(COUNT(battle.id) / :pageSize)', 'pageCount')
      .setParameter('pageSize', pageSize)
      .andWhere('player.tag = :playerTag', { playerTag: profile.tag })
      .andWhere('battle.profileId = :profileId', { profileId: profile.id });

    // Filter by exact date
    query = this.searchByDate(query, date, dateRange);

    // Filter by event
    query = this.searchByEvent(query, eventId);

    // Filter by brawler name
    query = this.searchByBrawler(query, brawlerName);

    // Execute the query and return results
    return await query.getRawOne();
  }

  async getSearchResults(profile, filters: SearchBattleDto) {
    const { page, pageSize, date, dateRange, eventId, brawlerName } = filters;

    // Base query
    let query = this.battleRepository
      .createQueryBuilder('battle')
      .innerJoin('battle.event', 'event')
      .addSelect('event.map')
      .addSelect('event.mode')
      .innerJoin('battle.players', 'player')
      .addSelect('player.brawlerName')
      .andWhere('player.tag = :playerTag', { playerTag: profile.tag })
      .andWhere('battle.profileId = :profileId', { profileId: profile.id });

    // Filter by exact date
    query = this.searchByDate(query, date, dateRange);

    // Filter by event
    query = this.searchByEvent(query, eventId);

    // Filter by brawler name
    query = this.searchByBrawler(query, brawlerName);

    // Pagination
    query = this.paginateSearch(query, profile, filters);

    // Execute the query and return results
    return await query.getMany();
  }

  searchByDate(
    query: SelectQueryBuilder<Battle>,
    date: string,
    dateRange: string,
  ): SelectQueryBuilder<Battle> {
    // Filter by exact date
    if (date) {
      query.andWhere('DATE(battle.battleTime) = :date', { date });
    }
    // Or filter by date range
    else if (dateRange) {
      const today = dayjs.utc().set('hour', 0).set('minute', 0).set('second', 0);
      let startOfRange;

      switch (dateRange) {
        case 'thisWeek':
          startOfRange = today.clone().subtract(1, 'week');
          break;
        case 'thisMonth':
          startOfRange = today.clone().subtract(1, 'month');
          break;
        case 'thisYear':
          startOfRange = today.clone().subtract(1, 'year');
          break;
        default:
          startOfRange = today;
      }

      query = query.andWhere('battle.battleTime >= :startOfRange', {
        startOfRange: startOfRange.format(),
      });
    }
    return query;
  }

  searchByEvent(
    query: SelectQueryBuilder<Battle>,
    eventId: number,
  ): SelectQueryBuilder<Battle> {
    if (eventId) {
      query = query.andWhere('event.id = :eventId', { eventId });
    }
    return query;
  }

  searchByBrawler(
    query: SelectQueryBuilder<Battle>,
    brawlerName: string,
  ): SelectQueryBuilder<Battle> {
    if (brawlerName) {
      query = query.andWhere('player.brawlerName = :brawlerName', {
        brawlerName,
      });
    }
    return query;
  }

  paginateSearch(
    query: SelectQueryBuilder<Battle>,
    profile,
    filters: SearchBattleDto
  ): SelectQueryBuilder<Battle> {
    const { page, pageSize, date, dateRange, eventId, brawlerName } = filters;

    return query
      .innerJoin(
        (subQuery: SelectQueryBuilder<Battle>) => {
          subQuery
            .select('battle.id as joinedId')
            .from(Battle, 'battle')
            .innerJoin('battle.players', 'player')
            .andWhere('player.tag = :playerTag', { playerTag: profile.tag })
            .andWhere('battle.profileId = :profileId', { profileId: profile.id })
            .orderBy('battle.battleTime', 'DESC');

          // Filter by exact date
          subQuery = this.searchByDate(subQuery, date, dateRange);

          // Filter by event
          subQuery = this.searchByEvent(subQuery, eventId);

          // Filter by brawler name
          subQuery = this.searchByBrawler(subQuery, brawlerName);

          return subQuery.limit(pageSize).offset((page - 1) * pageSize);
        },
        'battle2',
        'battle.id = battle2.joinedId',
      )
      .orderBy('battle.battleTime', 'DESC');
  }
}
