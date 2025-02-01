import { CreateBrawlerDto } from '../../brawlers/dto/create-brawler.dto';

export class CreatePlayerDto {
  readonly tag: string;
  readonly name: string;
  readonly brawler: CreateBrawlerDto;
}
