import { CreateProfileBrawlerDto } from '../../profile-brawlers/dto/create-profile-brawler.dto';

export class CreateStatDto {
  readonly profileId: string;
  readonly tag: string;
  readonly trophies: number;
  readonly highestTrophies: number;
  readonly expLevel: number;
  readonly expPoints: number;
  readonly trioVictories: number;
  readonly duoVictories: number;
  readonly soloVictories: number;
  readonly bestRoboRumbleTime: number;
  readonly bestTimeAsBigBrawler: number;
  readonly brawlers: Array<CreateProfileBrawlerDto>;
}
