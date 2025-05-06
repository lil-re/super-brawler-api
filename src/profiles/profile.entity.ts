import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Battle } from '../battles/battle.entity';
import { Stat } from '../stats/stat.entity';
import { ProfileBrawler } from '../profile-brawlers/profile-brawler.entity';

export enum ProfileStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tag: string;

  @Column()
  username: string;

  @Column({
    type: 'enum',
    enum: ProfileStatus,
    default: ProfileStatus.ACTIVE,
  })
  status: ProfileStatus;

  @Column({ default: () => 'NOW()' })
  createdAt: Date;

  @OneToMany(() => Battle, (battle) => battle.profile)
  battles: Battle[];

  @OneToMany(() => Stat, (stat) => stat.profile)
  stats: Stat[];

  @OneToMany(() => ProfileBrawler, (profileBrawler) => profileBrawler.profile)
  profileBrawlers: ProfileBrawler[];
}
