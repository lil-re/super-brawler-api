import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Battle } from '../battles/battle.entity';
import { Stat } from '../stats/stat.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  tag: string;

  @ManyToOne(() => User, (user) => user.profiles)
  user: User;

  @OneToMany(() => Battle, (battle) => battle.profile)
  battles: Battle[];

  @OneToMany(() => Stat, (stat) => stat.profile)
  stats: Stat[];
}
