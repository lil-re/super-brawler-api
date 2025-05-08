import { CreateGadgetDto } from '../../gadgets/dto/create-gadget.dto';
import { CreateGearDto } from '../../gears/dto/create-gear.dto';
import { CreateStarPowerDto } from '../../star-powers/dto/create-star-power.dto';

export class CreateProfileBrawlerDto {
  readonly id: number;
  readonly name: string;
  readonly power: number;
  readonly rank: number;
  readonly trophies: number;
  readonly highestTrophies: number;
  readonly starPowers: Array<CreateStarPowerDto>;
  readonly gadgets: Array<CreateGadgetDto>;
  readonly gears: Array<CreateGearDto>;
}
