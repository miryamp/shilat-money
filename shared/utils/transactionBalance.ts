import { TransactionType } from '../entities/transaction-type.enum';

export function calculateTransactionsBalance(transactions: { amount: number; type: TransactionType }[]): number {
  return transactions.reduce((sum, transaction) => {
    return sum + (transaction.type === TransactionType.Income ? 
        transaction.amount :
        -transaction.amount);
  }, 0);
}
