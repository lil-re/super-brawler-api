import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Battle } from '../battles/battle.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  eventId: number;

  @Column()
  mode: string;

  @Column()
  map: string;

  @OneToMany(() => Battle, (battle) => battle.event)
  battles: Battle[];

  @Column({ default: () => 'NOW()' })
  createdAt: Date;
}
