import { Column, Entity, Unique } from 'typeorm';
import { ITransaction } from 'shared/entities/transaction.interface';
import { BaseTransactionData } from './base-transaction-data';

@Entity()
@Unique(['recurrenceId', 'householdId', 'timestamp'])
export class Transaction extends BaseTransactionData implements ITransaction {
    @Column({ default: false })
    isDeleted: boolean;
    
    @Column({ nullable: true })
    recurrenceId?: string;

    @Column({ type: 'timestamp' })
    timestamp: Date;

    @Column({ type: 'timestamp', nullable: false })
    lastUpdated: Date;
}
