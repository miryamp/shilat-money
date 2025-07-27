import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { ITransaction } from 'shared/entities/transaction.interface';
import { BaseTransactionData } from './base-transaction-data';
import { RecurrentTransaction } from './recurrent-transaction';

@Entity()
@Unique(['recurrenceId', 'householdId', 'timestamp'])
export class Transaction extends BaseTransactionData implements ITransaction {
    @Column({ default: false })
    isDeleted: boolean;
    
    @Column({ nullable: true })
    recurrenceId?: string;

    @ManyToOne(() => RecurrentTransaction, {onDelete: 'CASCADE'})
    @JoinColumn({ name: 'recurrenceId' })
    recurrentTransaction?: RecurrentTransaction;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date;

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    lastUpdated: Date;
}
