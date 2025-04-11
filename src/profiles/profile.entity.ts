import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Battle } from '../battles/battle.entity';
import { Stat } from '../stats/stat.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  tag: string;

  @OneToMany(() => Battle, (battle) => battle.profile)
  battles: Battle[];

  @OneToMany(() => Stat, (stat) => stat.profile)
  stats: Stat[];
}
