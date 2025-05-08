import { Inject, Injectable } from '@nestjs/common';
import { CreateBrawlerDto } from './dto/create-brawler.dto';
import { Repository } from 'typeorm';
import { Brawler } from './brawler.entity';
import { Gadget } from '../gadgets/gadget.entity';
import { StarPower } from '../star-powers/star-power.entity';
import { GadgetsService } from '../gadgets/gadgets.service';
import { StarPowersService } from '../star-powers/star-powers.service';

@Injectable()
export class BrawlersService {
  constructor(
    @Inject('BRAWLER_REPOSITORY')
    private brawlerRepository: Repository<Brawler>,

    private gadgetService: GadgetsService,

    private starPowerService: StarPowersService,
  ) {}

  async create(createBrawlerDto: CreateBrawlerDto): Promise<Brawler> {
    const newBrawler = this.brawlerRepository.create({
      brawlerId: createBrawlerDto.id,
      label: createBrawlerDto.name,
    });


    if (!newBrawler) {
      throw new Error(`Brawler could not be created`);
    }

    const brawler = await this.brawlerRepository.save(newBrawler);
    this.handleGadgets(createBrawlerDto, brawler);
    this.handleStarPowers(createBrawlerDto, brawler);

    return brawler;
  }

  handleGadgets(createBrawlerDto: CreateBrawlerDto, brawler: Brawler) {
    createBrawlerDto.gadgets.map((createGadgetDto) => {
      return this.gadgetService.create(createGadgetDto, brawler);
    });
  }

  handleStarPowers(createBrawlerDto: CreateBrawlerDto, brawler: Brawler) {
    createBrawlerDto.starPowers.map((createStarPowerDto) => {
      return this.starPowerService.create(createStarPowerDto, brawler);
    });
  }
}
