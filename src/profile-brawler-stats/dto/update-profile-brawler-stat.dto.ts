import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileBrawlerStatDto } from './create-profile-brawler-stat.dto';

export class UpdateProfileBrawlerStatDto extends PartialType(
  CreateProfileBrawlerStatDto,
) {}
