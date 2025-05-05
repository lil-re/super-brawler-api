import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { Battle } from './battle.entity';
import { Event } from '../events/event.entity';
import { Profile } from '../profiles/profile.entity';
import { EventsService } from '../events/events.service';
import { PlayersService } from '../players/players.service';
import { ProfilesService } from '../profiles/profiles.service';
import { CreateBattleDto } from './dto/create-battle.dto';

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
    const profile = await this.profilesService.findOneByIdAndTag(
      createBattleDto.profileId,
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
        if (createBattlePlayerDto.tag === createBattleDto.profileTag) {
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
  }

  private async handleNewSoloPlayers(
    createBattleDto: CreateBattleDto,
    battle: Battle,
  ) {
    for (const createBattlePlayerDto of createBattleDto.battle.players) {
      if (createBattlePlayerDto.tag === createBattleDto.profileTag) {
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
}
