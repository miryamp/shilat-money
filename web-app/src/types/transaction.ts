import { ITransaction } from "shared/entities/transaction.interface";
import { ICategory } from "shared/entities/category.interface";
import { TransactionType } from "shared/entities/transaction-type.enum";

export class Transaction implements ITransaction{
    id: string;
    householdId: string;
    userId: string;
    categoryId: string;
    category: ICategory;
    recurrenceId?: string;
    recurrentTransaction?: {
        id: string;
        startDate: Date;
        endDate?: Date;
        frequency: number; // in days
        type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    };
    amount: number;
    timestamp: Date;
    comment?: string;
    lastUpdated: Date;
    
    get type(): TransactionType {
        return this.category.type;
    }
}