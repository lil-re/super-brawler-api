import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Brawler {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  brawlerId: number;

  @Column()
  name: string;

  @Column()
  power: number;

  @Column()
  trophies: number;
}
