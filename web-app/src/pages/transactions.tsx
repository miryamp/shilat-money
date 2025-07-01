import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AddTransactionModal from '@/components/transactions/AddTransactionModal';
import TransactionList from '@/components/transactions/TransactionList';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/types/transaction';
import { TransactionType } from 'shared/entities/transaction-type.enum';
import { calculateTransactionsBalance } from 'shared/utils/transactionBalance';
import TransactionFilters, { TransactionFilter } from '@/components/transactions/TransactionFilters';
import { addTransaction, fetchTransactions } from '@/services/transactionService';

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<TransactionFilter>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    types: [TransactionType.Income, TransactionType.Expense],
  });
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  // Fetch transactions from backend on mount and when filter changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          from: filter.from ? filter.from.toISOString().slice(0, 10) : undefined,
          to: filter.to ? filter.to.toISOString().slice(0, 10) : undefined,
          types: filter.types.length === 1 ? filter.types : undefined,
        };
        const data = await fetchTransactions(params);
        setTransactions(data);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to fetch transactions' });
      }
    };
    fetchData();
  }, [filter]);

  const balance = calculateTransactionsBalance(transactions);

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [...prev, newTransaction]);
    await addTransaction(newTransaction);

    toast({
      title: "Transaction added",
      description: `${transaction.type === TransactionType.Income ? 'Income' : 'Expense'} of $${transaction.amount} has been added.`,
    });
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    if (transaction.type === TransactionType.Income) {
      setIsIncomeModalOpen(true);
    } else {
      setIsExpenseModalOpen(true);
    }
  };

  const handleUpdateTransaction = (updatedTransaction: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      setTransactions(prev => 
        prev.map(t => 
          t.id === editingTransaction.id 
            ? { ...updatedTransaction, id: editingTransaction.id }
            : t
        )
      );
      toast({
        title: "Transaction updated",
        description: "The transaction has been successfully updated.",
      });
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (transactionId: string, deleteOption?: 'this' | 'all' | 'up-to' | 'from') => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
    
    let message = "Transaction has been deleted.";
    if (deleteOption) {
      switch (deleteOption) {
        case 'this':
          message = "This occurrence has been deleted.";
          break;
        case 'all':
          message = "All occurrences have been deleted.";
          break;
        case 'up-to':
          message = "Occurrences up to this date have been deleted.";
          break;
        case 'from':
          message = "Occurrences from this date forward have been deleted.";
          break;
      }
    }
    
    toast({
      title: "Transaction deleted",
      description: message,
    });
  };

  const handleModalClose = () => {
    setIsIncomeModalOpen(false);
    setIsExpenseModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Balance */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Balance Display */}
          <div className="text-center mb-6">
            <div className="text-sm text-gray-500 mb-1">Current Balance</div>
            <div className={cn(
              "text-3xl font-bold",
              balance >= 0 ? "text-green-600" : "text-red-600"
            )}>
              ${Math.abs(balance).toFixed(2)}
            </div>
          </div>

          {/* Filters */}
          <TransactionFilters filter={filter} onFilterChange={setFilter} />
        </div>

        {/* Transaction List */}
        <TransactionList 
          transactions={transactions}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onAddTransaction={(type) => {
            if (type === TransactionType.Income) setIsIncomeModalOpen(true);
            else setIsExpenseModalOpen(true);
          }}
        />

        {/* Add/Edit Transaction Modals */}
        <AddTransactionModal
          isOpen={isIncomeModalOpen}
          onClose={handleModalClose}
          onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
          type={TransactionType.Income}
        />

        <AddTransactionModal
          isOpen={isExpenseModalOpen}
          onClose={handleModalClose}
          onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
          type={TransactionType.Expense}
        />
      </div>
    </div>
  );
};

export default Transactions;