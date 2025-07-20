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
import { addTransaction, fetchTransactions, deleteTransaction as apiDeleteTransaction, updateTransaction as apiUpdateTransaction } from '@/services/transactionService';
import { deleteRecurrenceTransaction, patchRecurrenceTransactionDates } from '@/services/recurrenceTransactionService';

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<TransactionFilter>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    types: [TransactionType.Income, TransactionType.Expense],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  const fetchAndSetTransactions = async () => {
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

  // Fetch transactions from backend on mount and when filter changes
  useEffect(() => {
    fetchAndSetTransactions();
  }, [filter]);

  const balance = calculateTransactionsBalance(transactions);

  const matchesCurrentFilter = (transaction: Transaction) => {
    if (filter.from && new Date(transaction.timestamp) < new Date(filter.from)) return false;
    if (filter.to && new Date(transaction.timestamp) > new Date(filter.to)) return false;
    if (filter.types && filter.types.length && !filter.types.includes(transaction.type)) return false;
    return true;
  };

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString()
    };
    if (matchesCurrentFilter(newTransaction)) {
      setTransactions(prev => [...prev, newTransaction]);
    }
    await addTransaction(newTransaction);

    toast({
      title: "Transaction added",
      description: `${transaction.type === TransactionType.Income ? 'Income' : 'Expense'} of $${transaction.amount} has been added.`,
    });
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalType(transaction.type);
    setIsModalOpen(true);
  };

  const handleUpdateTransaction = async (updatedTransaction: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      try {
        await apiUpdateTransaction(editingTransaction.id, updatedTransaction);
        const updated: Transaction = { ...updatedTransaction, id: editingTransaction.id };
        setTransactions(prev => {
          const filtered = prev.filter(t => t.id !== editingTransaction.id);
          return matchesCurrentFilter(updated) ? [...filtered, updated] : filtered;
        });
        toast({
          title: "Transaction updated",
          description: "The transaction has been successfully updated.",
        });
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to update transaction' });
      }
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (transaction: Transaction, deleteOption?: 'this' | 'all' | 'up-to' | 'from') => {
    try {
      if (!deleteOption) {
        toast({
          title: "Error",
          description: "Please select a delete option.",
        });
        return;
      }

      let message = "Transaction has been deleted.";
      switch (deleteOption) {
        case 'this':
          message = "This occurrence has been deleted.";
          await apiDeleteTransaction(transaction.id);
          break;
        case 'all':
          await deleteRecurrenceTransaction(transaction.recurrenceId);
          message = "All occurrences have been deleted.";
          break;
        case 'up-to':
          await patchRecurrenceTransactionDates(transaction.recurrenceId, { endDate: transaction.timestamp });
          message = "Occurrences up to this date have been deleted.";
          break;
        case 'from':
          await patchRecurrenceTransactionDates(transaction.recurrenceId, { startDate: transaction.timestamp });
          message = "Occurrences from this date forward have been deleted.";
          break;
      }

      await fetchAndSetTransactions();

      toast({
        title: "Transaction deleted",
        description: message,
      });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete transaction' });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setModalType(null);
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
            setModalType(type);
            setIsModalOpen(true);
          }}
        />

        {/* Add/Edit Transaction Modal */}
        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
          type={modalType ?? TransactionType.Expense}
          transaction={editingTransaction ? editingTransaction : undefined}
        />
      </div>
    </div>
  );
};

export default Transactions;