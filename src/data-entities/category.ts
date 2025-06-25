import { TransactionType } from './transaction-type';

export interface Category {
    id: string;
    householdId: string;
    name: string;
    type: TransactionType;
    color: string; // hex color code
    icon: string; 
}
