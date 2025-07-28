import { TransactionType } from 'shared/entities/transaction-type.enum';

interface DefaultCategory {
    name: string;
    type: TransactionType;
    color: string;
    icon: string;
}

export const defaultCategories: DefaultCategory[] = [
    // Income Categories
    {
        name: 'Salary',
        type: TransactionType.Income,
        color: '#449947ff',
        icon: 'payments'
    },

    // Expense Categories
    {
        name: 'Housing',
        type: TransactionType.Expense,
        color: '#2196F3',
        icon: 'home'
    },
    {
        name: 'Transportation',
        type: TransactionType.Expense,
        color: '#FF9800',
        icon: 'directions_car'
    },
    {
        name: 'Groceries',
        type: TransactionType.Expense,
        color: '#8BC34A',
        icon: 'shopping_cart'
    },
    {
        name: 'Utilities',
        type: TransactionType.Expense,
        color: '#9C27B0',
        icon: 'power'
    },
    {
        name: 'Healthcare',
        type: TransactionType.Expense,
        color: '#F44336',
        icon: 'local_hospital'
    },
    {
        name: 'Entertainment',
        type: TransactionType.Expense,
        color: '#FF4081',
        icon: 'movie'
    },
    {
        name: 'Shopping',
        type: TransactionType.Expense,
        color: '#795548',
        icon: 'shopping_bag'
    },
    {
        name: 'Dining Out',
        type: TransactionType.Expense,
        color: '#FFC107',
        icon: 'restaurant'
    }
];
