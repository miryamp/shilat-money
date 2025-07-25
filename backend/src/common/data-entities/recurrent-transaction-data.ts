import { Entity, OneToOne } from 'typeorm';
import { RecurrentTransaction } from './recurrent-transaction';
import { BaseTransactionData } from './base-transaction-data';

@Entity()
export class RecurrentTransactionData extends BaseTransactionData {
    @OneToOne(() => RecurrentTransaction, { onDelete: 'CASCADE' })
    recurrentTransaction: RecurrentTransaction;
}
