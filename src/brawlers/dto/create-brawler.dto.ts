import { CreateStarPowerDto } from '../../star-powers/dto/create-star-power.dto';
import { CreateGadgetDto } from '../../gadgets/dto/create-gadget.dto';

export class CreateBrawlerDto {
  readonly id: number;
  readonly name: string;
  readonly starPowers: Array<CreateStarPowerDto>;
  readonly gadgets: Array<CreateGadgetDto>;
}
