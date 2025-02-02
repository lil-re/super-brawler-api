import { Inject, Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Repository } from 'typeorm';
import { Event } from './event.entity';

@Injectable()
export class EventsService {
  constructor(
    @Inject('EVENT_REPOSITORY')
    private eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto) {
    const event = await this.eventRepository.findOneBy({
      eventId: createEventDto.eventId,
    });

    if (event) {
      throw new Error(`Event already exists`);
    }

    const newEvent = this.eventRepository.create(createEventDto);

    if (!newEvent) {
      throw new Error(`Event could not be created`);
    }
    return this.eventRepository.save(newEvent);
  }

  findAll() {
    return this.eventRepository.find();
  }

  async findOne(id: number) {
    const event = await this.eventRepository.findOneBy({ id });

    if (!event) {
      throw new Error(`Event with id ${id} not found`);
    }
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    const event = await this.eventRepository.preload({
      id,
      ...updateEventDto,
    });

    if (!event) {
      throw new Error(`Event with id ${id} not found`);
    }
    return this.eventRepository.save(event);
  }

  async remove(id: number) {
    const event = await this.eventRepository.findOneBy({ id });

    if (!event) {
      throw new Error(`Event with id ${id} not found`);
    }
    await this.eventRepository.remove(event);
  }
}
