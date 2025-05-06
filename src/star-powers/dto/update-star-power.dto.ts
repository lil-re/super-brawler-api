import { PartialType } from '@nestjs/mapped-types';
import { CreateStarPowerDto } from './create-star-power.dto';

export class UpdateStarPowerDto extends PartialType(CreateStarPowerDto) {}
