import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Profile } from '../profiles/profile.entity';
import { ProfileBrawler } from '../profile-brawlers/profile-brawler.entity';

@Entity()
export class ProfileBrawlerStat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  power: number;

  @Column()
  rank: number;

  @Column()
  trophies: number;

  @Column()
  highestTrophies: number;

  @ManyToOne(
    () => ProfileBrawler,
    (profileBrawler) => profileBrawler.profileBrawlerStats,
  )
  profileBrawler: ProfileBrawler;

  @Column({ default: () => 'NOW()' })
  createdAt: Date;
}
