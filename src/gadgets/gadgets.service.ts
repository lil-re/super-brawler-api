import { Inject, Injectable } from '@nestjs/common';
import { CreateGadgetDto } from './dto/create-gadget.dto';
import { Repository } from 'typeorm';
import { Gadget } from './gadget.entity';
import { Brawler } from '../brawlers/brawler.entity';

@Injectable()
export class GadgetsService {
  constructor(
    @Inject('GADGET_REPOSITORY')
    private gadgetRepository: Repository<Gadget>,
  ) {}

  async create(createGadgetDto: CreateGadgetDto, brawler: Brawler) {
    const newGadget = this.gadgetRepository.create({
      id: createGadgetDto.id,
      label: createGadgetDto.name,
      brawler,
    });

    if (!newGadget) {
      throw new Error(`Gadget could not be created`);
    }
    return this.gadgetRepository.save(newGadget);
  }
}
