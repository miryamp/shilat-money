import { Transaction } from '../common/data-entities/transaction';

export interface TransactionRepository {
    create(transaction: Transaction): Promise<Transaction>;
    findAll(householdId: string): Promise<Transaction[]>;
    findOne(id: string, householdId: string): Promise<Transaction | null>;
    update(id: string, update: Partial<Transaction>, householdId: string): Promise<Transaction | null>;
    remove(id: string, householdId: string): Promise<Transaction | null>;
    findByDateRange(householdId: string, from: Date, to: Date): Promise<Transaction[]>;
}
