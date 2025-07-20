
import React from 'react';
import { Transaction } from '@/types/transaction';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DeleteTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteOption?: 'this' | 'all' | 'up-to' | 'from') => void;
  transaction: Transaction | null;
}

const DeleteTransactionModal: React.FC<DeleteTransactionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction
}) => {
  if (!transaction) return null;

  const handleSimpleDelete = () => {
    onConfirm('this');
  };

  const handleRecurringDelete = (option: 'this' | 'all' | 'up-to' | 'from') => {
    onConfirm(option);
  };

  if (!transaction.recurrenceId) {
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSimpleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="min-w-[520px] max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            This transaction is part of a recurring series.<br />
            <span className="font-semibold">What would you like to delete?</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col items-center py-4">
          <div className="mb-4 text-center">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {transaction.category?.name} &middot; {transaction.amount} &middot; {transaction.timestamp && (new Date(transaction.timestamp)).toLocaleDateString()}
            </span>
          </div>
          <div className="w-full flex flex-row gap-2 justify-center items-center">
            <div className="relative group">
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white px-2 min-w-[90px] h-8"
                onClick={() => handleRecurringDelete('all')}
              >
                <span className="font-medium">Delete All</span>
              </Button>
              <div className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                All past and future occurrences will be deleted
              </div>
            </div>
            <div className="relative group">
              <Button
                size="sm"
                className="px-2 min-w-[90px] h-8"
                variant="outline"
                onClick={() => handleRecurringDelete('this')}
              >
                <span className="font-medium">Only This One</span>
              </Button>
              <div className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                This specific transaction will be deleted
              </div>
            </div>
            <div className="relative group">
              <Button
                size="sm"
                className="px-2 min-w-[90px] h-8"
                variant="outline"
                onClick={() => handleRecurringDelete('up-to')}
              >
                <span className="font-medium">This & Past</span>
              </Button>
              <div className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                All occurrences up to and including this one will be deleted
              </div>
            </div>
            <div className="relative group">
              <Button
                size="sm"
                className="px-2 min-w-[90px] h-8"
                variant="outline"
                onClick={() => handleRecurringDelete('from')}
              >
                <span className="font-medium">This & Future</span>
              </Button>
              <div className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                This occurrence and all future ones will be deleted
              </div>
            </div>
            <AlertDialogCancel onClick={onClose} className="h-8 px-3">Cancel</AlertDialogCancel>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTransactionModal;
