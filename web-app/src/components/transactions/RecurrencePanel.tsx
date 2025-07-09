import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Repeat } from 'lucide-react';
import { format, addDays, addMonths, addYears, setDate as setDateFns, getDate, getMonth, getYear } from 'date-fns';
import { cn } from '@/lib/utils';
import { getLastValidDailyDate, getValidMonthlyDate, getValidYearlyDate } from '@/utils/recurrenceDateUtils';

function calculateEndDateFromCount({
  startDate,
  recurrenceType,
  interval,
  count,
}: {
  startDate: Date;
  recurrenceType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  count: number;
}): Date {
  if (recurrenceType === 'daily') {
    return getLastValidDailyDate(startDate, addDays(startDate, (count - 1) * interval), interval);
  } else if (recurrenceType === 'weekly') {
    return getLastValidDailyDate(startDate, addDays(startDate, (count - 1) * 7), 7);
  } else if (recurrenceType === 'monthly') {
    let target = addMonths(startDate, count - 1);
    target = addDays(target, 1);
    return getValidMonthlyDate(startDate, target);
  } else if (recurrenceType === 'yearly') {
    const target = addYears(startDate, count - 1);
    return getValidYearlyDate(startDate, target);
  }
  return startDate;
}

interface RecurrencePanelProps {
  isOpen: boolean;
  startDate: Date;
  onStartDateChange: (date: Date) => void;
  onSave: (recurrence: RecurrenceData) => void;
}

export interface RecurrenceData {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  endCondition: 'never' | 'after' | 'on';
  endCount?: number;
  endDate?: Date;
}

const RecurrencePanel: React.FC<RecurrencePanelProps> = ({
  isOpen,
  startDate,
  onStartDateChange,
  onSave
}) => {
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [dailyInterval, setDailyInterval] = useState(1);
  const [monthlyDay, setMonthlyDay] = useState(getDate(startDate));
  const [yearlyMonth, setYearlyMonth] = useState(getMonth(startDate) + 1);
  const [yearlyDay, setYearlyDay] = useState(getDate(startDate));
  const [endCondition, setEndCondition] = useState<'never' | 'after' | 'on'>('never');
  const [endCount, setEndCount] = useState(12);
  const [endDate, setEndDate] = useState<Date>(addMonths(startDate, 12));
  const [endConditionOpen, setEndConditionOpen] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  // When startDate changes, set default endDate according to rules
  useEffect(() => {
    let newEndDate: Date | null = null;
    if (recurrenceType === 'daily') {
      newEndDate = addYears(startDate, 1); // always 1 year after start, regardless of interval
    } else if (recurrenceType === 'monthly') {
      newEndDate = addMonths(startDate, 12); // 1 year
      newEndDate = getValidMonthlyDate(startDate, newEndDate);
    } else if (recurrenceType === 'yearly') {
      newEndDate = addYears(startDate, 10); // 10 years
      newEndDate = getValidYearlyDate(startDate, newEndDate);
    }
    if (newEndDate) setEndDate(newEndDate);
    setUserMessage(null);
  }, [startDate, recurrenceType, dailyInterval]);

  // When user picks an end date, validate and correct if needed
  const handleEndDateChange = (date: Date) => {
    let validDate = date;
    let message = null;
    if (recurrenceType === 'daily') {
      const diff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diff % dailyInterval !== 0) {
        validDate = getLastValidDailyDate(startDate, date, dailyInterval);
        message = 'End date adjusted to last valid occurrence.';
      }
    } else if (recurrenceType === 'monthly') {
      const startDay = getDate(startDate);
      if (getDate(date) !== startDay) {
        validDate = getValidMonthlyDate(startDate, date);
        message = 'End date adjusted to valid day in chosen month.';
      }
    } else if (recurrenceType === 'yearly') {
      const startDay = getDate(startDate);
      const startMonth = getMonth(startDate);
      if (getDate(date) !== startDay || getMonth(date) !== startMonth) {
        validDate = getValidYearlyDate(startDate, date);
        message = 'End date adjusted to valid recurrence date in chosen year.';
      }
    }
    setEndDate(validDate);
    setUserMessage(message);
  };

  // Sync recurrence settings when start date changes
  useEffect(() => {
    if (recurrenceType === 'monthly') {
      setMonthlyDay(getDate(startDate));
    } else if (recurrenceType === 'yearly') {
      setYearlyMonth(getMonth(startDate) + 1);
      setYearlyDay(getDate(startDate));
    }
  }, [startDate, recurrenceType]);

  // Propagate recurrence data on any relevant state change
  useEffect(() => {
    let type = recurrenceType;
    let interval = dailyInterval;
    let calculatedEndDate = endDate;
    if (recurrenceType === 'weekly') {
      type = 'daily';
      interval = 7;
    }
    if (endCondition === 'after' && endCount) {
      calculatedEndDate = calculateEndDateFromCount({
        startDate,
        recurrenceType,
        interval,
        count: endCount,
      });
    }
    const recurrenceData: RecurrenceData = {
      type: type,
      interval: type === 'daily' ? interval : undefined,
      endCondition,
      endCount: endCondition === 'after' ? endCount : undefined,
      endDate: endCondition === 'on' || endCondition === 'after' ? calculatedEndDate : undefined,
    };
    onSave(recurrenceData);
    // eslint-disable-next-line
  }, [recurrenceType, dailyInterval, monthlyDay, yearlyMonth, yearlyDay, endCondition, endCount, endDate, startDate]);

  // Update start date when recurrence settings change
  const handleRecurrenceChange = (type: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setRecurrenceType(type);
    if (type === 'monthly') {
      const newDay = monthlyDay;
      const newDate = setDateFns(startDate, newDay);
      if (newDate < new Date()) {
        onStartDateChange(setDateFns(addMonths(startDate, 1), newDay));
      } else {
        onStartDateChange(newDate);
      }
    } else if (type === 'yearly') {
      const newDate = new Date(getYear(startDate), yearlyMonth - 1, yearlyDay);
      if (newDate < new Date()) {
        onStartDateChange(new Date(getYear(startDate) + 1, yearlyMonth - 1, yearlyDay));
      } else {
        onStartDateChange(newDate);
      }
    }
  };

  const handleMonthlyDayChange = (day: number) => {
    setMonthlyDay(day);
    const newDate = setDateFns(startDate, day);
    if (newDate < new Date()) {
      onStartDateChange(setDateFns(addMonths(startDate, 1), day));
    } else {
      onStartDateChange(newDate);
    }
  };

  const handleYearlyDateChange = (month: number, day: number) => {
    setYearlyMonth(month);
    setYearlyDay(day);
    const newDate = new Date(getYear(startDate), month - 1, day);
    if (newDate < new Date()) {
      onStartDateChange(new Date(getYear(startDate) + 1, month - 1, day));
    } else {
      onStartDateChange(newDate);
    }
  };

  const getPreviewText = () => {
    let preview = "Will repeat ";

    switch (recurrenceType) {
      case 'daily':
        preview += `every ${dailyInterval} day${dailyInterval > 1 ? 's' : ''}`;
        break;
      case 'weekly':
        preview += `every week`;
        break;
      case 'monthly':
        preview += `every ${monthlyDay}${getOrdinalSuffix(monthlyDay)} of the month`;
        break;
      case 'yearly':
        preview += `every ${format(new Date(2024, yearlyMonth - 1, yearlyDay), 'MMMM do')}`;
        break;
    }

    preview += ` starting ${format(startDate, 'MMM d')}`;

    if (endCondition === 'after') {
      preview += ` for ${endCount} times`;
    } else if (endCondition === 'on') {
      preview += ` until ${format(endDate, 'MMM d, yyyy')}`;
    }

    return preview;
  };

  const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const handleSave = () => {
    let type = recurrenceType;
    let interval = dailyInterval;

    if (recurrenceType === 'weekly') {
      type = 'daily';
      interval = 7; 
    }
    const recurrenceData: RecurrenceData = {
      type: type,
      interval: type === 'daily' ? interval : undefined,
      endCondition,
      endCount: endCondition === 'after' ? endCount : undefined,
      endDate: endCondition === 'on' ? endDate : undefined,
    };
    onSave(recurrenceData);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 p-6 bg-white border rounded-lg shadow-lg z-10 space-y-6">
      {/* Recurrence Type Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Recurrence Pattern</Label>
        <RadioGroup value={recurrenceType} onValueChange={handleRecurrenceChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="daily" id="daily" />
            <Label htmlFor="daily" className="flex items-center gap-2 cursor-pointer">
              Every
              <Input
                type="number"
                min="1"
                max="365"
                value={dailyInterval}
                onChange={(e) => {
                  setDailyInterval(parseInt(e.target.value) || 1);
                  handleSave();
                }
                }
                className="w-16 h-8"
              />
              days
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="weekly" id="weekly" />
            <Label htmlFor="weekly" className="cursor-pointer">Weekly</Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="monthly" id="monthly" />
            <Label htmlFor="monthly" className="flex items-center gap-2 cursor-pointer">
              Monthly on
              <Input
                type="number"
                min="1"
                max="31"
                value={monthlyDay}
                onChange={(e) => {
                  handleMonthlyDayChange(parseInt(e.target.value) || 1);
                  handleSave();
                }}
                className="w-16 h-8"
              />
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yearly" id="yearly" />
            <Label htmlFor="yearly" className="flex items-center gap-2 cursor-pointer">
              Yearly on
              <Select value={yearlyMonth.toString()} onValueChange={(value) => {
                handleYearlyDateChange(parseInt(value), yearlyDay);
                handleSave();
              }}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {format(new Date(2024, i, 1), 'MMM')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="1"
                max="31"
                value={yearlyDay}
                onChange={(e) => {
                  handleYearlyDateChange(yearlyMonth, parseInt(e.target.value) || 1);
                  handleSave();
                }}
                className="w-16 h-8"
              />
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* End Condition */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center cursor-pointer select-none" onClick={() => setEndConditionOpen((v) => !v)}>
          <span className="mr-2">End Condition</span>
          <span className={cn("transition-transform", endConditionOpen ? "rotate-90" : "rotate-0")}>▶</span>
        </Label>
        {endConditionOpen && (
          <RadioGroup value={endCondition} onValueChange={(value: 'never' | 'after' | 'on') => setEndCondition(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="never" id="never" />
              <Label htmlFor="never" className="cursor-pointer">Never</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="after" id="after" />
              <Label htmlFor="after" className="flex items-center gap-2 cursor-pointer">
                Ends after
                <Input
                  type="number"
                  min="1"
                  max="999"
                  value={endCount}
                  onChange={(e) => setEndCount(parseInt(e.target.value) || 1)}
                  className="w-20 h-8"
                />
                times
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="on" id="on" />
              <Label htmlFor="on" className="flex items-center gap-2 cursor-pointer">
                Ends on
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8 text-left">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(endDate, "MMM d, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      value={endDate}
                      onChange={(date) => date && handleEndDateChange(date)}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </Label>
            </div>
          </RadioGroup>
        )}
      </div>

      {/* Preview */}
      <div className="p-3 bg-gray-50 rounded-md">
        <div className="text-sm text-gray-600 mb-1">Preview:</div>
        <div className="text-sm font-medium">{getPreviewText()}</div>
      </div>

      {userMessage && (
        <div className="text-xs text-yellow-600 mb-2">{userMessage}</div>
      )}
    </div>
  );
};

export default RecurrencePanel;
