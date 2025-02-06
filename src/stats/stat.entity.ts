import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Profile } from '../profiles/profile.entity';

@Entity()
export class Stat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  trophies: number;

  @Column()
  highestTrophies: number;

  @Column()
  expLevel: number;

  @Column()
  expPoints: number;

  @Column()
  trioVictories: number;

  @Column()
  duoVictories: number;

  @Column()
  soloVictories: number;

  @Column()
  bestRoboRumbleTime: number;

  @Column()
  bestTimeAsBigBrawler: number;

  @ManyToOne(() => Profile, (profile) => profile.stats)
  profile: Profile;
}
