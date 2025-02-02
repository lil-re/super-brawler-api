export class CreateBattleEventDto {
  readonly id: number;
  readonly mode: string;
  readonly map: string;
}

export class CreateBattleContentDto {
  readonly starPlayer: CreateBattlePlayerDto;
  readonly mode: string;
  readonly duration: number;
  readonly result: string;
  readonly rank: number;
  readonly trophyChange: number;
  readonly type: string;
  readonly players: Array<CreateBattlePlayerDto>;
}

export class CreateBattlePlayerDto {
  readonly tag: string;
  readonly name: string;
  readonly brawler: CreateBattleBrawlerDto;
}

export class CreateBattleBrawlerDto {
  readonly id: number;
  readonly name: string;
  readonly power: number;
  readonly trophies: number;
}

export class CreateBattleDto {
  readonly profileTag: string;
  readonly battleTime: string;
  readonly event: CreateBattleEventDto;
  readonly battle: CreateBattleContentDto;
}
