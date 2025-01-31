import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Battle } from './battle.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventId: number;

  @Column()
  mode: string;

  @Column()
  map: string;

  @OneToMany(() => Battle, (battle) => battle.event)
  battles: Battle[];
}
