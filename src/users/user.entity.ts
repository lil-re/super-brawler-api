import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: 'en' })
  language: string;

  @Column({ default: 'lightTheme' })
  theme: string;

  @Column({ default: false })
  isAdmin: boolean;
}
