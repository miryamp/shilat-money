
import React from 'react';
import { Transaction } from '@/types/Transaction';
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
    onConfirm();
  };

  const handleRecurringDelete = (option: 'this' | 'all' | 'up-to' | 'from') => {
    onConfirm(option);
  };

  if (!transaction.isRecurring) {
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
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            This is a recurring transaction. What would you like to delete?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-2 py-4">
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => handleRecurringDelete('this')}
          >
            <div>
              <div className="font-medium">Delete only this occurrence</div>
              <div className="text-sm text-gray-500">Keep all other recurring transactions</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => handleRecurringDelete('all')}
          >
            <div>
              <div className="font-medium">Delete all occurrences</div>
              <div className="text-sm text-gray-500">Remove the entire recurring transaction</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => handleRecurringDelete('up-to')}
          >
            <div>
              <div className="font-medium">Delete up to this occurrence</div>
              <div className="text-sm text-gray-500">Keep future occurrences only</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => handleRecurringDelete('from')}
          >
            <div>
              <div className="font-medium">Delete from this occurrence forward</div>
              <div className="text-sm text-gray-500">Keep past occurrences only</div>
            </div>
          </Button>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTransactionModal;
