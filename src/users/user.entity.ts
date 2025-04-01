import {
  Column,
  Entity, OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from '../profiles/profile.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: 'en' })
  language: string;

  @Column({ default: 'lightTheme' })
  theme: string;

  @Column({ default: false })
  isAdmin: string;

  @OneToMany(() => Profile, (profile) => profile.user)
  profiles: Profile[];
}
