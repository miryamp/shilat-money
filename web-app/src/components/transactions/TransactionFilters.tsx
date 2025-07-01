import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { TransactionType } from 'shared/entities/transaction-type.enum';

export interface TransactionFilter {
  from: Date | null;
  to: Date | null;
  types: TransactionType[];
}

interface TransactionFiltersProps {
  filter: TransactionFilter;
  onFilterChange: (filter: TransactionFilter) => void;
}

const typeOptions = [TransactionType.Income, TransactionType.Expense];

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ filter, onFilterChange }) => {
  // Date handlers
  const setFrom = (date: Date | null) => onFilterChange({ ...filter, from: date });
  const setTo = (date: Date | null) => onFilterChange({ ...filter, to: date });
  const clearFrom = () => setFrom(null);
  const clearTo = () => setTo(null);

  // Type filter logic
  const handleTypeToggle = (type: TransactionType) => {
    const { types } = filter;
    if (types.includes(type)) {
      if (types.length === 2) {
        // Remove this type, keep the other
        onFilterChange({ ...filter, types: types.filter(t => t !== type) });
      } else {
        // Only one is selected, switch to the other
        onFilterChange({ ...filter, types: [typeOptions.find(t => t !== type)!] });
      }
    } else {
      // Add this type (always max 2)
      onFilterChange({ ...filter, types: [...types, type] });
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
      {/* Date Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">From:</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              {filter.from ? format(filter.from, "MMM dd, yyyy") : <span className="text-gray-400">None</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filter.from ?? undefined}
              onSelect={date => setFrom(date ?? null)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
            <Button variant="ghost" onClick={clearFrom} className="w-full text-gray-500 mt-2">Clear From</Button>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">To:</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              {filter.to ? format(filter.to, "MMM dd, yyyy") : <span className="text-gray-400">None</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filter.to ?? undefined}
              onSelect={date => setTo(date ?? null)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
            <Button variant="ghost" onClick={clearTo} className="w-full text-gray-500 mt-2">Clear To</Button>
          </PopoverContent>
        </Popover>
      </div>
      {/* Type Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Type:</span>
        {typeOptions.map(type => (
          <Button
            key={type}
            variant={filter.types.includes(type) ? 'default' : 'outline'}
            className={
              'min-w-[90px] border-2 ' +
              (filter.types.includes(type)
                ? type === TransactionType.Income
                  ? 'bg-green-100 text-green-700 border-green-600 hover:bg-green-600 hover:text-white'
                  : 'bg-red-100 text-red-700 border-red-600 hover:bg-red-600 hover:text-white'
                : type === TransactionType.Income
                  ? 'border-green-600 text-green-600'
                  : 'border-red-600 text-red-600')
            }
            onClick={() => handleTypeToggle(type)}
          >
            {type}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TransactionFilters;
