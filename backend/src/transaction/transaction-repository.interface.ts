import { TransactionType } from 'shared/entities/transaction-type.enum';
import { Transaction } from '../common/data-entities/transaction';

export interface TransactionRepository {
    create(transaction: Transaction): Promise<Transaction>;
    findAll(householdId: string, options?: {
        userId?: string;
        categoryId?: string | string[];
        type?: TransactionType;
        amount?: { gt?: number; gte?: number; lt?: number; lte?: number; eq?: number };
        from?: Date;
        to?: Date;
    }): Promise<Transaction[]>;
    findOne(id: string, householdId: string): Promise<Transaction | null>;
    update(id: string, update: Partial<Transaction>, householdId: string): Promise<Transaction | null>;
    remove(id: string, householdId: string): Promise<Transaction | null>;
}
