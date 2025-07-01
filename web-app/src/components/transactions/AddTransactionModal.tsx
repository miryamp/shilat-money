import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchCategories } from '@/services/categoryService';
import { ICategory } from 'shared/dist/entities/category.interface';
import TransactionForm from './TransactionForm';
import { Transaction } from '@/types/transaction';
import { TransactionType } from 'shared/dist/entities/transaction-type.enum';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  type: TransactionType;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  type
}) => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ICategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [recurringInterval, setRecurringInterval] = useState<number>(1);
  const [recurringDate, setRecurringDate] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const subcategoriesMap = categories.reduce((acc, cat) => {
    if (cat.fatherId) {
      if (!acc[cat.fatherId]) {
        acc[cat.fatherId] = [];
      }
      acc[cat.fatherId].push(cat);
    }
    return acc;
  }, {} as Record<string, ICategory[]>);

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
    if (subcategoriesMap[category.id] && subcategoriesMap[category.id].length > 0) {
      toggleCategoryExpansion(category.id);
    } else {
      setSelectedCategory(category);
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategorySelect = (subcategory: ICategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedCategory(null);
  };

  const getSelectedCategoryInfo = () => {
    if (selectedSubcategory) return selectedSubcategory;
    if (selectedCategory) return selectedCategory;
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCategoryInfo = getSelectedCategoryInfo();
    if (!selectedCategoryInfo || !amount) {
      return;
    }

    const transaction = {
      amount: parseFloat(amount),
      categoryId: selectedCategoryInfo.id,
      category: selectedCategoryInfo,
      type,
      comment: comment.trim() || undefined,
      timestamp: date,
      lastUpdated: new Date(),
      householdId: 'default-household-id', // Replace with actual household ID logic
      userId: 'default-user-id', // Replace with actual user ID logic
    } as Omit<Transaction, "id">;

    onSubmit(transaction);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setExpandedCategories(new Set());
    setAmount('');
    setComment('');
    setDate(new Date());
    setIsRecurring(false);
    setRecurringType('monthly');
    setRecurringInterval(1);
    setRecurringDate('');
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
            Add {type === TransactionType.Income ? 'Income' : 'Expense'}
          </DialogTitle>
        </DialogHeader>
        
        <TransactionForm
          type={type}
          categories={categories}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          expandedCategories={expandedCategories}
          amount={amount}
          comment={comment}
          date={date}
          loading={loading}
          isRecurring={isRecurring}
          recurringType={recurringType}
          recurringInterval={recurringInterval}
          recurringDate={recurringDate}
          onCategorySelect={handleCategorySelect}
          onSubcategorySelect={handleSubcategorySelect}
          onToggleExpansion={toggleCategoryExpansion}
          onAmountChange={setAmount}
          onCommentChange={setComment}
          onDateChange={setDate}
          onRecurringChange={setIsRecurring}
          onRecurringTypeChange={setRecurringType}
          onRecurringIntervalChange={setRecurringInterval}
          onRecurringDateChange={setRecurringDate}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          getSelectedCategoryInfo={getSelectedCategoryInfo}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;
