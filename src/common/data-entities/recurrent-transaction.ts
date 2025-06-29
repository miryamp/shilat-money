import { Entity, PrimaryColumn, Column } from 'typeorm';
import { RecurrentTransactionType } from './recurrent-transaction-type.enum';
import { Transaction } from './transaction';


@Entity()
export class RecurrentTransaction {
    @PrimaryColumn()
    id: string;

    @Column({ type: 'json' })
    transactionData: Transaction;

    @Column({ type: 'enum', enum: RecurrentTransactionType })
    type: RecurrentTransactionType;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date', nullable: true })
    endDate?: Date;

    @Column({ type: 'timestamp', nullable: true, default: null })
    lastOperated?: Date | null;

    @Column({ default: false })
    shiftToValidDate: boolean;

    @Column({ default: true })
    active: boolean;

    get isFixed(): boolean {
        return this.type !== RecurrentTransactionType.Daily;
    }
}
