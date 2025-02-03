export class CreatePlayerDto {
  readonly tag: string;
  readonly name: string;
  readonly brawlerId: number;
  readonly brawlerName: string;
  readonly power: number;
  readonly trophies: number;
  readonly battleId: number;
  readonly team?: number;
}
