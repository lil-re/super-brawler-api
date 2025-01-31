import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Battle } from './battle.entity';
import { Brawler } from './brawler.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tag: string;

  @Column()
  name: string;

  @ManyToOne(() => Battle, (battle) => battle.players)
  battle: Battle;

  @OneToOne(() => Brawler)
  @JoinColumn()
  brawler: Brawler;
}
