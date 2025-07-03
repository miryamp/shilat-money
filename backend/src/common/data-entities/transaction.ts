import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Category } from './category';
import { Household } from './household';
import { User } from './user';
import { ITransaction } from 'shared/dist/entities/transaction.interface';

@Entity()
@Unique(['recurrenceId', 'householdId', 'timestamp'])
export class Transaction implements ITransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    householdId: string;

    @ManyToOne(() => Household, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'householdId' })
    household: Household;

    @Column()
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    categoryId: string;

    @Column({ nullable: true })
    recurrenceId?: string;

    @ManyToOne(() => Category, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @Column('decimal', { 
        precision: 12, 
        scale: 2,
        transformer: {
            to: (value: number) => value?.toString(),
            from: (value: string) => value !== null && value !== undefined ? Number(value) : value
        }
    })
    amount: number;

    @Column({ type: 'timestamp' })
    timestamp: Date;

    @Column({ nullable: true })
    comment?: string;

    @Column({ type: 'timestamp', nullable: false })
    lastUpdated: Date;
}


