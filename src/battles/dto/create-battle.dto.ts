import { CreateEventDto } from '../../events/dto/create-event.dto';
import { CreatePlayerDto } from '../../players/dto/create-player.dto';

export class CreateBattleDto {
  readonly playerTag: string;
  readonly starPlayerTag: string;
  readonly battleTime: Date;
  readonly duration: number;
  readonly result: string;
  readonly rank: number;
  readonly trophyChange: number;
  readonly type: string;
  readonly event: CreateEventDto;
  readonly players: Array<CreatePlayerDto>;
}
