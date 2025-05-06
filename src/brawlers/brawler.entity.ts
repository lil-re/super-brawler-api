import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Gadget } from '../gadgets/gadget.entity';
import { StarPower } from '../star-powers/star-power.entity';
import { ProfileBrawler } from '../profile-brawlers/profile-brawler.entity';

@Entity()
export class Brawler {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @OneToMany(() => Gadget, (gadget) => gadget.brawler)
  gadgets: Gadget[];

  @OneToMany(() => StarPower, (starPower) => starPower.brawler)
  starPowers: StarPower[];

  @OneToMany(() => ProfileBrawler, (pb) => pb.brawler)
  profileBrawlers: ProfileBrawler[];
}
