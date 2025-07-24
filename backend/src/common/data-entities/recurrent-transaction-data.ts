import { Entity, Column, OneToOne } from 'typeorm';
import { RecurrentTransaction } from './recurrent-transaction';
import { BaseTransactionData } from './base-transaction-data';

@Entity()
export class RecurrentTransactionData extends BaseTransactionData {
    @OneToOne(() => RecurrentTransaction, recurrentTransaction => recurrentTransaction.transactionData, { onDelete: 'CASCADE' })
    recurrentTransaction: RecurrentTransaction;
}
