import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Gear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;
}
