import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from './category';
import { Household } from './household';

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    householdId: string;

    @ManyToOne(() => Household, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'householdId' })
    household: Household;

    @Column()
    userId: string;

    @Column()
    categoryId: string;

    @Column({ nullable: true })
    reacurrenceId?: string;

    @ManyToOne(() => Category, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @Column('decimal', { precision: 12, scale: 2 })
    amount: number;

    @Column({ type: 'timestamp' })
    timestamp: Date;

    @Column({ nullable: true })
    comment?: string;

    @Column({ type: 'timestamp', nullable: false })
    lastUpdated: Date;
}
