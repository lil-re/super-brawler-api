import { Inject, Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { Repository } from 'typeorm';
import { Event } from './event.entity';

@Injectable()
export class EventsService {
  constructor(
    @Inject('EVENT_REPOSITORY')
    private eventRepository: Repository<Event>,
  ) {}

  public static COMMUNITY_ID = null;
  public static COMMUNITY_MAP = 'community';

  async create(createEventDto: CreateEventDto) {
    const event = await this.eventRepository.findOneBy({
      eventId: createEventDto.eventId,
      mode: createEventDto.mode,
      map: createEventDto.map,
    });

    if (event) {
      return event;
    }

    const newEvent = this.eventRepository.create(createEventDto);

    if (!newEvent) {
      throw new Error(`Event could not be created`);
    }
    return this.eventRepository.save(newEvent);
  }
}
