import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

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

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MODERATOR,
  })
  role: UserRole;

  @Column({ default: () => 'NOW()' })
  createdAt: Date;
}
