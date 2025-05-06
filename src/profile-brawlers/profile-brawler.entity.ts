import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { Profile } from '../profiles/profile.entity';
import { Brawler } from '../brawlers/brawler.entity';
import { Gadget } from '../gadgets/gadget.entity';
import { StarPower } from '../star-powers/star-power.entity';

@Entity()
export class ProfileBrawler {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Profile, (profile) => profile.profileBrawlers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  @ManyToOne(() => Brawler, (brawler) => brawler.profileBrawlers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brawlerId' })
  brawler: Brawler;

  @ManyToMany(() => Gadget, (gadget) => gadget.profileBrawlers)
  @JoinTable({
    name: 'profile_brawler_gadgets',
    joinColumn: { name: 'profileBrawlerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'gadgetId', referencedColumnName: 'id' },
  })
  gadgets: Gadget[];

  @ManyToMany(() => StarPower, (starPower) => starPower.profileBrawlers)
  @JoinTable({
    name: 'profile_brawler_starpowers',
    joinColumn: { name: 'profileBrawlerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'starPowerId', referencedColumnName: 'id' },
  })
  starPowers: StarPower[];
}
