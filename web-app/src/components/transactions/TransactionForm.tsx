
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {ICategory} from 'shared/entities/category.interface';
import CategorySelector from './CategorySelector';
import RecurrencePanel, { RecurrenceData } from './RecurrencePanel';
import { TransactionType } from 'shared/entities/transaction-type.enum';

interface TransactionFormProps {
  type: TransactionType;
  categories: ICategory[];
  subcategoriesMap: Record<string, ICategory[]>;
  selectedCategory: ICategory | null;
  selectedSubcategory: ICategory | null;
  expandedCategories: Set<string>;
  amount: string;
  comment: string;
  date: Date;
  loading: boolean;
  isRecurring: boolean;
  recurringType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringInterval: number;
  recurringDate: string;
  onCategorySelect: (category: ICategory) => void;
  onSubcategorySelect: (subcategory: ICategory) => void;
  onToggleExpansion: (categoryId: string) => void;
  onAmountChange: (amount: string) => void;
  onCommentChange: (comment: string) => void;
  onDateChange: (date: Date) => void;
  onRecurringChange: (isRecurring: boolean) => void;
  onRecurringTypeChange: (type: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  onRecurringIntervalChange: (interval: number) => void;
  onRecurringDateChange: (date: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  getSelectedCategoryInfo: () => ICategory | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  type,
  categories,
  subcategoriesMap,
  selectedCategory,
  selectedSubcategory,
  expandedCategories,
  amount,
  comment,
  date,
  loading,
  onCategorySelect,
  onSubcategorySelect,
  onToggleExpansion,
  onAmountChange,
  onCommentChange,
  onDateChange,
  onRecurringChange,
  onRecurringTypeChange,
  onRecurringIntervalChange,
  onSubmit,
  onCancel,
  getSelectedCategoryInfo
}) => {
  const [isRecurrencePanelOpen, setIsRecurrencePanelOpen] = useState(false);

  const handleRecurrenceSave = (recurrenceData: RecurrenceData) => {
    onRecurringChange(true);
    onRecurringTypeChange(recurrenceData.type);
    if (recurrenceData.interval) {
      onRecurringIntervalChange(recurrenceData.interval);
    }
    setIsRecurrencePanelOpen(false);
  };

  const handleRecurrenceCancel = () => {
    setIsRecurrencePanelOpen(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Category Selection */}
      <CategorySelector
        categories={categories}
        subcategoriesMap={subcategoriesMap}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        expandedCategories={expandedCategories}
        loading={loading}
        onCategorySelect={onCategorySelect}
        onSubcategorySelect={onSubcategorySelect}
        onToggleExpansion={onToggleExpansion}
      />

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal w-full"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => selectedDate && onDateChange(selectedDate)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Recurrence */}
      <div className="space-y-2 relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsRecurrencePanelOpen(!isRecurrencePanelOpen)}
          className="w-full justify-start"
        >
          <Repeat className="mr-2 h-4 w-4" />
          Repeat
        </Button>
        
        <RecurrencePanel
          isOpen={isRecurrencePanelOpen}
          startDate={date}
          onStartDateChange={onDateChange}
          onSave={handleRecurrenceSave}
          onCancel={handleRecurrenceCancel}
        />
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">Comment (optional)</Label>
        <Input
          id="comment"
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Add a note about this transaction..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!getSelectedCategoryInfo() || !amount}
          className={cn(
            "flex-1",
            type === TransactionType.Income ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
          )}
        >
          Add {type === TransactionType.Income ? 'Income' : 'Expense'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
