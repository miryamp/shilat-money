
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteKeepTransactions: () => void;
  onDeleteWithTransactions: () => void;
  categoryName: string;
}

const DeleteCategoryModal = ({ 
  isOpen, 
  onClose, 
  onDeleteKeepTransactions, 
  onDeleteWithTransactions, 
  categoryName 
}: DeleteCategoryModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-red-600">
            Delete Category
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            Are you sure you want to delete the category "{categoryName}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button
            onClick={onDeleteKeepTransactions}
            variant="outline"
            className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            Delete category, but keep associated transactions
          </Button>
          <Button
            onClick={onDeleteWithTransactions}
            variant="destructive"
            className="w-full"
          >
            Delete category and all of its transactions
          </Button>
          <AlertDialogCancel className="w-full mt-2">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCategoryModal;
