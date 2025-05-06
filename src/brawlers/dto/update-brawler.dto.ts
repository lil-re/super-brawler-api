import { PartialType } from '@nestjs/mapped-types';
import { CreateBrawlerDto } from './create-brawler.dto';

export class UpdateBrawlerDto extends PartialType(CreateBrawlerDto) {}
