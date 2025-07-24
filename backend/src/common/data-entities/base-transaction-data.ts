import { PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from './category';
import { Household } from './household';
import { User } from './user';
import { ITransactionData } from 'shared/entities/transaction-data.interface';
import { Currency } from 'shared/entities/currency.enum';
import { TransactionType } from 'shared/entities/transaction-type.enum';
import { transformDate } from '../transformers/normalize-date.transformer';

export abstract class BaseTransactionData implements ITransactionData {
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

    @Column({ type: 'enum', enum: Currency })
    currency: Currency;

    @Column({ nullable: true })
    comment?: string;
}
