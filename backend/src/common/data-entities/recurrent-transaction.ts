import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { RecurrentTransactionType } from 'shared/entities/recurrent-transaction-type.enum';
import { Transaction } from './transaction';
import { IRecurrentTransaction } from 'shared/entities/recurrent-transaction.interface';


@Entity()
export class RecurrentTransaction implements IRecurrentTransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    householdId: string;

    @Column({ type: 'json' })
    transactionData: Transaction;

    @Column({ type: 'enum', enum: RecurrentTransactionType })
    type: RecurrentTransactionType;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date', nullable: true })
    endDate?: Date;

    @Column({ type: 'timestamp', nullable: true, default: null })
    lastOperated?: Date;

    @Column({ default: false })
    shiftToValidDate: boolean;

    @Column({ default: true })
    active: boolean;

    get isFixed(): boolean {
        return this.type !== RecurrentTransactionType.Daily;
    }
}
