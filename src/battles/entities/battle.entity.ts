import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Player } from './player.entity';
import { Event } from './event.entity';

@Entity()
export class Battle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  playerTag: string;

  @Column({ nullable: true })
  starPlayerTag: string;

  @Column()
  battleTime: Date;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  result: 'victory' | 'defeat';

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
