import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Household } from './household';

export enum Language {
  EN = 'en',
  HE = 'he',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  householdId: string;

  @ManyToOne(() => Household, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'householdId' })
  household: Household;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'enum', enum: Language, default: Language.EN })
  language: Language;
}
