import { RecurrenceStrategy } from "./recurrence-strategy";
import { MonthlyRecurrence } from "../recurrence-types/monthly-recurrence.interface";
import { addMonths, isLastDayOfMonth, lastDayOfMonth } from 'date-fns';

export const MonthlyRecurrenceStrategy: RecurrenceStrategy<MonthlyRecurrence> = {
    getNextDate(from: Date, recurrence: MonthlyRecurrence): Date | null {
        const originalDay = from.getDate();
        let next = addMonths(from, 1);
        if (next.getDate() === originalDay || recurrence.shiftToValidDate) {
            return next;
        }

        // If date is invalid, skip to next month
        // There is no date that is absent two months in a row
        next = addMonths(next, 1);
        next.setDate(from.getDate());
        return next;
    },

    getPreviousDate(from: Date, recurrence: MonthlyRecurrence): Date | null {
        const originalDay = from.getDate();
        let prev = addMonths(from, -1);
        if (prev.getDate() === originalDay || recurrence.shiftToValidDate) {
            return prev;
        }

        // If date is invalid, skip to prev month
        // There is no date that is absent two months in a row
        prev = addMonths(prev, -1);
        prev.setDate(from.getDate());
        return prev;
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