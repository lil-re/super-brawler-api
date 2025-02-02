import { Inject, Injectable } from '@nestjs/common';
import { UpdateBattleDto } from './dto/update-battle.dto';
import { Repository } from 'typeorm';
import { Battle } from './battle.entity';
import { Event } from '../events/event.entity';
import { Player } from '../players/player.entity';

@Injectable()
export class BattlesService {
  constructor(
    @Inject('BATTLE_REPOSITORY')
    private battleRepository: Repository<Battle>,

    @Inject('EVENT_REPOSITORY')
    private eventRepository: Repository<Event>,

    @Inject('PLAYER_REPOSITORY')
    private playerRepository: Repository<Player>,
  ) {}

  async create(payload) {
    // Handle Event
    const event: Event = await this.handleNewEvent(payload);

    // Handle Battle
    const battle = await this.handleNewBattle(payload, event);

    // Handle Players
    await this.handleNewPlayers(payload, battle);

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

  private async handleNewEvent(payload) {
    let event = await this.eventRepository.findOneBy({
      eventId: payload.event.id,
    });

    if (!event) {
      const newEvent = this.eventRepository.create({
        eventId: payload.event.id,
        mode: payload.event.mode,
        map: payload.event.map,
      });
      event = await this.eventRepository.save(newEvent);
    }
    return event;
  }

  private async handleNewBattle(payload, event: Event) {
    const newBattle = this.battleRepository.create({
      starPlayerTag: payload.battle?.starPlayer?.tag,
      battleTime: this.parseDate(payload.battleTime),
      duration: payload.battle.duration,
      result: payload.battle.result,
      rank: payload.battle.rank,
      trophyChange: payload.battle.trophyChange,
      type: payload.battle.type,
      event: event,
    });
    const battle = await this.battleRepository.save(newBattle);
    return battle;
  }

  private async handleNewPlayers(payload, battle: Battle) {
    for (let playerPayload of payload.battle.players) {
      const newPlayer = this.playerRepository.create({
        tag: playerPayload.tag,
        name: playerPayload.name,
        brawlerId: playerPayload.brawler.id,
        brawlerName: playerPayload.brawler.name,
        power: playerPayload.brawler.power,
        trophies: playerPayload.brawler.trophies,
        battle,
      });
      await this.playerRepository.save(newPlayer);
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
