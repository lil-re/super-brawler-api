import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany } from 'typeorm';
import { Brawler } from '../brawlers/brawler.entity';
import { ProfileBrawler } from '../profile-brawlers/profile-brawler.entity';

@Entity()
export class Gadget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @ManyToOne(() => Brawler, (brawler) => brawler.gadgets)
  brawler: Brawler;

  @ManyToMany(() => ProfileBrawler, (profileBrawler) => profileBrawler.gadgets)
  profileBrawlers: ProfileBrawler[];
}
