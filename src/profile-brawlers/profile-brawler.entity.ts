import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Profile } from '../profiles/profile.entity';
import { Brawler } from '../brawlers/brawler.entity';
import { Gadget } from '../gadgets/gadget.entity';
import { StarPower } from '../star-powers/star-power.entity';
import { ProfileBrawlerStat } from '../profile-brawler-stats/profile-brawler-stat.entity';

@Entity()
export class ProfileBrawler {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(
    () => ProfileBrawlerStat,
    (profileBrawlerStat) => profileBrawlerStat.profileBrawler,
  )
  profileBrawlerStats: ProfileBrawlerStat[];

  @ManyToOne(() => Brawler, (brawler) => brawler.profileBrawlers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'brawlerId' })
  brawler: Brawler;

  @ManyToOne(() => Profile, (profile) => profile.profileBrawlers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  @ManyToMany(() => Gadget, (gadget) => gadget.profileBrawlers)
  @JoinTable({
    name: 'profile_brawler_gadgets',
    joinColumn: { name: 'profileBrawlerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'gadgetId', referencedColumnName: 'id' },
  })
  gadgets: Gadget[];

  @ManyToMany(() => StarPower, (starPower) => starPower.profileBrawlers)
  @JoinTable({
    name: 'profile_brawler_star_powers',
    joinColumn: { name: 'profileBrawlerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'starPowerId', referencedColumnName: 'id' },
  })
  starPowers: StarPower[];
}
