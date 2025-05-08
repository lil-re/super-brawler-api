import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ProfileBrawler } from '../profile-brawlers/profile-brawler.entity';

@Entity()
export class Gear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @ManyToOne(() => ProfileBrawler, (profileBrawler) => profileBrawler.gadgets)
  profileBrawler: ProfileBrawler;
}
