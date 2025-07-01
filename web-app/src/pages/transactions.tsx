
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import AddTransactionModal from '@/components/transactions/AddTransactionModal';
import TransactionList from '@/components/transactions/TransactionList';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/types/transaction';
import { TransactionType } from 'shared/entities/transaction-type.enum';

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  });
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.timestamp);
    return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
  });

  const balance = filteredTransactions.reduce((sum, transaction) => {
    return sum + (transaction.type === TransactionType.Income ? transaction.amount : -transaction.amount);
  }, 0);

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
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

  const clearDateFilter = () => {
    setDateRange({
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
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
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsIncomeModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Income
              </Button>
              <Button
                onClick={() => setIsExpenseModalOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Minus className="w-4 h-4 mr-2" />
                Expense
              </Button>
            </div>
          </div>

          {/* Balance Display */}
          <div className="text-center mb-6">
            <div className="text-sm text-gray-500 mb-1">Current Balance</div>
            <div className={cn(
              "text-3xl font-bold",
              balance >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {balance >= 0 ? '+' : ''}${balance.toFixed(2)}
            </div>
          </div>

          {/* Date Filters */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">From:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-40">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(dateRange.from, "MMM dd, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">To:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-40">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(dateRange.to, "MMM dd, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button variant="ghost" onClick={clearDateFilter} className="text-gray-500">
              Clear Filter
            </Button>
          </div>
        </div>

        {/* Transaction List */}
        <TransactionList 
          transactions={filteredTransactions}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
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