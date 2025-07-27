import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchCategories } from '@/services/categoryService';
import { ICategory } from 'shared/entities/category.interface';
import TransactionForm from './TransactionForm';
import { Transaction } from '@/types/transaction';
import { TransactionType } from 'shared/entities/transaction-type.enum';
import { useHousehold } from '@/context/HouseholdContext';
import { addTransaction } from '@/services/transactionService';
import { addRecurrenceTransaction } from '@/services/recurrenceTransactionService';
import { IRecurrentTransaction } from 'shared/entities/recurrent-transaction.interface';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  type: TransactionType;
  transaction?: Transaction | null;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  transaction
}) => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState<Record<string, ICategory[]>>({});
  const { householdId } = useHousehold();
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ICategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1);
  const [recurrenceDate, setRecurrenceDate] = useState<string>('');
  const [recurrenceData, setRecurrenceData] = useState<any>(null); // Store RecurrencePanel data

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (transaction && categories.length > 0) {
      populateFormWithTransaction(transaction);
    }
  }, [transaction, categories]);

  const populateFormWithTransaction = (trans: Transaction) => {
    setAmount(trans.amount.toString());
    setComment(trans.comment || '');
    setDate(new Date(trans.timestamp));
    setIsRecurring(!!trans.recurrenceId);
    // setRecurringType(trans.recurringType || 'monthly');
    // setRecurringInterval(trans.recurringInterval || 1);
    // setRecurringDate(trans.recurringDate || '');
    
    // Find and set the category
    const category = categories.find(cat => cat.id === trans.categoryId);
    if (category) {
      if (category.fatherId) {
        // It's a subcategory
        setSelectedSubcategory(category);
        setSelectedCategory(null);
        setExpandedCategories(prev => new Set(prev).add(category.fatherId!));
      } else {
        // It's a main category
        setSelectedCategory(category);
        setSelectedSubcategory(null);
      }
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const [fetchedCategories, subcategoriesMap] = await fetchCategories(type);
      setCategories(fetchedCategories);
      setSubCategoriesMap(subcategoriesMap);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCategorySelect = (category: ICategory) => {
    if (selectedCategory?.id === category.id) {
      // Unselect if clicking the same category
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else if (subCategoriesMap[category.id] && subCategoriesMap[category.id].length > 0) {
      // Toggle expansion if it has subcategories
      toggleCategoryExpansion(category.id);
      // Also select the main category
      setSelectedCategory(category);
      setSelectedSubcategory(null);
    } else {
      // Select category without subcategories
      setSelectedCategory(category);
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategorySelect = (subcategory: ICategory) => {
    if (selectedSubcategory?.id === subcategory.id) {
      // Unselect if clicking the same subcategory
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(subcategory);
      setSelectedCategory(null);
    }
  };

  const getSelectedCategoryInfo = () => {
    if (selectedSubcategory) return selectedSubcategory;
    if (selectedCategory) return selectedCategory;
    return null;
  };

  // Update recurrenceData when RecurrencePanel changes
  const handleRecurrencePanelChange = (data: any) => {
    setRecurrenceData(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCategoryInfo = getSelectedCategoryInfo();
    if (!selectedCategoryInfo || !amount) {
      return;
    }
    const transactionData = {
      amount: parseFloat(amount),
      categoryId: selectedCategoryInfo.id,
      category: selectedCategoryInfo,
      type,
      comment: comment.trim() || undefined,
      timestamp: date,
      lastUpdated: new Date(),
      householdId: householdId,
      userId: 'mainuser', // Replace with actual user ID logic
    } as Omit<Transaction, "id">;

    try {
      if (isRecurring && recurrenceData) {
        // Build IRecurrentTransaction (omit id)
        const recurrencePayload: Omit<IRecurrentTransaction, 'id'> = {
          householdId: householdId,
          transactionData,
          type: recurrenceData.type,
          frequency: recurrenceData.type === 'daily'? recurrenceInterval : undefined,
          startDate: date,
          endDate: recurrenceData.endDate,
          shiftToValidDate: false, // or true if you want to shift
          isActive: true,
        };
        await addRecurrenceTransaction(recurrencePayload);
      } else {
        onSubmit(transactionData);
      }
      resetForm();
      onClose();
    } catch (err) {
      // Optionally handle error
      console.error(err);
    }
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setExpandedCategories(new Set());
    setAmount('');
    setComment('');
    setDate(new Date());
    setIsRecurring(false);
    setRecurrenceType('monthly');
    setRecurrenceInterval(1);
    setRecurrenceDate('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Edit' : 'Add'} {type === TransactionType.Income ? 'Income' : 'Expense'}
          </DialogTitle>
        </DialogHeader>

        <TransactionForm
          type={type}
          categories={categories}
          subcategoriesMap={subCategoriesMap}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          expandedCategories={expandedCategories}
          amount={amount}
          comment={comment}
          date={date}
          loading={loading}
          isRecurring={isRecurring}
          recurrenceType={transaction?.recurrentTransaction?.type || "monthly"}
          recurrenceInterval={transaction?.recurrentTransaction?.frequency || 1}
          onCategorySelect={handleCategorySelect}
          onSubcategorySelect={handleSubcategorySelect}
          onToggleExpansion={toggleCategoryExpansion}
          onAmountChange={setAmount}
          onCommentChange={setComment}
          onDateChange={setDate}
          onRecurrenceChange={setIsRecurring}
          onRecurrenceTypeChange={setRecurrenceType}
          onRecurrenceIntervalChange={setRecurrenceInterval}
          onRecurrenceDateChange={setRecurrenceDate}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          getSelectedCategoryInfo={getSelectedCategoryInfo}
          submitLabel={transaction ? 'Edit' : undefined}
          // Add RecurrencePanel change handler
          onRecurrencePanelChange={handleRecurrencePanelChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;
