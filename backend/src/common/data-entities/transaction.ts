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

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date;

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    lastUpdated: Date;
}
