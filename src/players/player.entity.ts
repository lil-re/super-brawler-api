import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Battle } from '../battles/battle.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tag: string;

  @Column()
  name: string;

  @Column()
  brawlerId: number;

  @Column()
  brawlerName: string;

  @Column()
  power: number;

  @Column()
  trophies: number;

  @Column({ nullable: true })
  team: number;

  @ManyToOne(() => Battle, (battle) => battle.players)
  battle: Battle;
}
