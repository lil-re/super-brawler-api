import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany } from 'typeorm';
import { Brawler } from '../brawlers/brawler.entity';
import { ProfileBrawler } from '../profile-brawlers/profile-brawler.entity';

@Entity()
export class StarPower {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @ManyToOne(() => Brawler, (brawler) => brawler.starPowers)
  brawler: Brawler;

  @ManyToMany(() => ProfileBrawler, (profileBrawler) => profileBrawler.starPowers)
  profileBrawlers: ProfileBrawler[];
}
