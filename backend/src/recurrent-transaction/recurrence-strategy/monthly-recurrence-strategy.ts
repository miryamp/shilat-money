import { RecurrenceStrategy } from "./recurrence-strategy";
import { MonthlyRecurrence } from "../recurrence-types/monthly-recurrence.interface";
import { addMonths, isLastDayOfMonth, lastDayOfMonth } from 'date-fns';

export const MonthlyRecurrenceStrategy: RecurrenceStrategy<MonthlyRecurrence> = {
    getNextDate(from: Date, recurrence: MonthlyRecurrence): Date | null {
        const originalDay = from.getDate();
        const next = addMonths(from, 1);
        if (next.getDate() === originalDay || recurrence.shiftToValidDate) {
            return next;
        }

        // Find next valid month with the same day
        for (let i = 2; i <= 11; i++) {
            const tryMonth = addMonths(from, i);
            if (tryMonth.getDate() === originalDay) {
                return new Date(tryMonth.getFullYear(), tryMonth.getMonth(), originalDay);
            }
        }
        return null;
    },

    getPreviousDate(from: Date, recurrence: MonthlyRecurrence): Date | null {
        const originalDay = from.getDate();
        const prev = addMonths(from, -1);
        if (prev.getDate() === originalDay || recurrence.shiftToValidDate) {
            return prev;
        }

        // Find prev valid month with the same day
        for (let i = 2; i <= 11; i++) {
            const tryMonth = addMonths(from, -i);
            if (tryMonth.getDate() === originalDay) {
                return new Date(tryMonth.getFullYear(), tryMonth.getMonth(), originalDay);
            }
        }
        return null;
    },

    includesDate: function (date: Date, recurrence: MonthlyRecurrence): boolean {
        if (date < recurrence.startDate || (recurrence.endDate && date > recurrence.endDate)) {
            return false;
        }
        const startDay = recurrence.startDate.getDate();
        
        // If shiftToValidDate is true, allow last day of month for start days 29, 30, or 31
        if (date.getDate() === startDay) {
            return true;
        }

        // If shiftToValidDate is false and start date is not exactly the same as date
        if (!recurrence.shiftToValidDate) {
            return false;
        }

        const startIsEdgeDay = [29, 30, 31].includes(startDay);
        return isLastDayOfMonth(date) && startIsEdgeDay;
    }
}