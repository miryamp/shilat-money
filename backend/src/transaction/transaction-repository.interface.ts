import { TransactionType } from 'shared/entities/transaction-type.enum';
import { Transaction } from '../common/data-entities/transaction';

export interface TransactionRepository {
    create(transaction: Transaction, tx?: any): Promise<Transaction>;
    createMany(bulk: Transaction[], tx?: any): Promise<void>;
    findAll(householdId: string, options?: {
        userId?: string;
        categoryId?: string | string[];
        type?: TransactionType;
        amount?: { gt?: number; gte?: number; lt?: number; lte?: number; eq?: number };
        from?: Date;
        to?: Date;
        excludeFrom?: Date;
        excludeTo?: Date;
        recurrenceId?: string;
        isDeleted?: boolean;
    }): Promise<Transaction[]>;
    findOne(id: string, householdId: string, options?: {isDeleted?: boolean}): Promise<Transaction | null>;
    update(id: string, update: Partial<Transaction>, householdId: string, tx?: any): Promise<Transaction | null>;
    upsertMany(transactions: Transaction[], tx?: any): Promise<void>;
    remove(id: string, householdId: string, logicalDelete?: boolean, tx?: any): Promise<Transaction | null>;
    removeMany(ids: string[], householdId: string, logicalDelete?: boolean, tx?: any): Promise<void>;
}
