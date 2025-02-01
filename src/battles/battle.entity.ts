import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Player } from '../players/player.entity';
import { Event } from '../events/event.entity';

@Entity()
export class Battle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  starPlayerTag: string;

  @Column()
  battleTime: Date;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  result: string;

  @Column({ nullable: true })
  rank: number;

  @Column({ nullable: true })
  trophyChange: number;

  @Column()
  type: string;

  @ManyToOne(() => Event, (event) => event.battles)
  event: Event;

  @OneToMany(() => Player, (player) => player.battle)
  players: Player[];
}
