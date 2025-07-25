import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { RecurrentTransactionType } from 'shared/entities/recurrent-transaction-type.enum';
import { RecurrentTransactionData } from './recurrent-transaction-data';
import { IRecurrentTransaction } from 'shared/entities/recurrent-transaction.interface';
import { NormalizeDate, transformDate } from '../transformers/normalize-date.transformer';
import { BaseTransactionData } from './base-transaction-data';


@Entity()
export class RecurrentTransaction extends BaseTransactionData implements IRecurrentTransaction {
    @OneToOne(() => RecurrentTransactionData, recurrentTransactionData => recurrentTransactionData.recurrentTransaction, {
        cascade: true,
        eager: true,
    })
    @JoinColumn()
    transactionData: RecurrentTransactionData;

    @Column({ type: 'enum', enum: RecurrentTransactionType })
    type: RecurrentTransactionType;

    @Column({ type: 'int', nullable: true })
    frequency?: number;

    @Column({ type: 'date', transformer: { to: (date: Date) => date, from: (value: string) => transformDate(value) } })
    startDate: Date;

    @Column({ type: 'date', nullable: true, transformer: { to: (date: Date) => date, from: (value: string) => transformDate(value) } })
    endDate?: Date;

    @Column({ type: 'date', nullable: true, default: null, transformer: { to: (date: Date) => date, from: (value: string) => transformDate(value) } })
    lastOperated?: Date;

    @Column({ default: true })
    shiftToValidDate: boolean;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'timestamp', nullable: false })
    lastUpdated: Date;

    get isFixed(): boolean {
        return this.type !== RecurrentTransactionType.Daily;
    }
}
