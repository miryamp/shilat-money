import { ITransaction } from "shared/dist/entities/transaction.interface";
import { ICategory } from "shared/dist/entities/category.interface";
import { TransactionType } from "shared/dist/entities/transaction-type.enum";

export class Transaction implements ITransaction{
    id: string;
    householdId: string;
    userId: string;
    categoryId: string;
    category: ICategory;
    reacurrenceId?: string;
    amount: number;
    timestamp: Date;
    comment?: string;
    lastUpdated: Date;
    
    get type(): TransactionType {
        return this.category.type;
    }
}