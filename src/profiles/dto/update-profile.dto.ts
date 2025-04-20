import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create-profile.dto';
import { ProfileStatus } from '../profile.entity';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  readonly status: ProfileStatus;
}
