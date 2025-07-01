import React, { useState } from 'react';
import { Transaction } from '@/types/transaction';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Pen, Trash2 } from 'lucide-react';
import DeleteTransactionModal from './DeleteTransactionModal';
import { TransactionType } from 'shared/entities/transaction-type.enum';

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (transactionId: string, deleteOption?: 'this' | 'all' | 'up-to' | 'from') => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  onEditTransaction,
  onDeleteTransaction 
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleDeleteClick = (transaction: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    setTransactionToDelete(transaction);
    setDeleteModalOpen(true);
  };

  const handleEditClick = (transaction: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditTransaction?.(transaction);
  };

  const handleDeleteConfirm = (deleteOption?: 'this' | 'all' | 'up-to' | 'from') => {
    if (transactionToDelete && onDeleteTransaction) {
      onDeleteTransaction(transactionToDelete.id, deleteOption);
    }
    setDeleteModalOpen(false);
    setTransactionToDelete(null);
  };

  if (sortedTransactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-gray-400 mb-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">💰</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No transactions yet</h3>
        <p className="text-gray-500">Start by adding your first income or expense transaction</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Transactions ({sortedTransactions.length})
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={() => onEditTransaction && onEditTransaction({ type: TransactionType.Income } as any)}
                className="bg-green-600 hover:bg-green-700"
              >
                + Income
              </Button>
              <Button
                onClick={() => onEditTransaction && onEditTransaction({ type: TransactionType.Expense } as any)}
                className="bg-red-600 hover:bg-red-700"
              >
                - Expense
              </Button>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {sortedTransactions.map((transaction) => (
            <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors group relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: transaction.category.color }}
                  >
                    <span className="material-icons text-white text-sm">
                      {transaction.category.icon}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {transaction.category.name}
                      {transaction.reacurrenceId && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          🔁 Recurring
                        </span>
                      )}
                    </div>
                    {transaction.comment && (
                      <div className="text-sm text-gray-500">
                        {transaction.comment}
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      {format(new Date(transaction.timestamp), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-lg font-semibold ${
                    transaction.type === TransactionType.Income ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === TransactionType.Income ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </div>
                  
                  {/* Edit and Delete buttons - only visible on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-blue-600"
                      onClick={(e) => handleEditClick(transaction, e)}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
                      onClick={(e) => handleDeleteClick(transaction, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DeleteTransactionModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        transaction={transactionToDelete}
      />
    </>
  );
};

export default TransactionList;
