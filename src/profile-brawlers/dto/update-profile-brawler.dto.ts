import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileBrawlerDto } from './create-profile-brawler.dto';

export class UpdateProfileBrawlerDto extends PartialType(CreateProfileBrawlerDto) {}
