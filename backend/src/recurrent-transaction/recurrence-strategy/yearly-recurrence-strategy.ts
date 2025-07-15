import { RecurrenceStrategy } from "./recurrence-strategy";
import { YearlyRecurrence } from "../recurrence-types/yearly-recurrence.interface";
import { isLastDayOfMonth } from "date-fns";

export const YearlyRecurrenceStrategy: RecurrenceStrategy<YearlyRecurrence> = {
    getNextDate(from: Date, recurrence: YearlyRecurrence): Date | null {
        const originalMonth = from.getMonth();
        const originalDay = from.getDate();
        const originalYear = from.getFullYear();
        from.setFullYear(from.getFullYear() + 1);

        if (recurrence.endDate && from > recurrence.endDate) {
            return null;
        }

        // If shiftToValidDate and the new date is not the same month or day, set to last day of the original month
        if (recurrence.shiftToValidDate &&
            (from.getMonth() !== originalMonth)) {
            from = new Date(from.getFullYear(), originalMonth + 1, 0);
        }

        if (!recurrence.shiftToValidDate && originalMonth === 1 && originalDay === 29) {
            const leap = (originalYear + 4) % 100 === 0 && (originalYear + 4) % 400 !== 0
                ? 8 : 4 // Adjust for leap years
            return new Date(from.getFullYear() + (leap - 1), originalMonth, originalDay);
        }

        return from;
    },

    getPreviousDate(from: Date, recurrence: YearlyRecurrence): Date | null {
        const originalMonth = from.getMonth();
        const originalDay = from.getDate();
        const originalYear = from.getFullYear();
        from.setFullYear(from.getFullYear() - 1);

        if (recurrence.shiftToValidDate &&
            (from.getMonth() !== originalMonth)) {
            from = new Date(from.getFullYear(), originalMonth + 1, 0);
        }

        if (!recurrence.shiftToValidDate && originalMonth === 1 && originalDay === 29) {
            const leap = (originalYear - 4) % 100 === 0 && (originalYear - 4) % 400 !== 0
                ? 8 : 4 // Adjust for leap years
            return new Date(from.getFullYear() - (leap - 1), originalMonth, originalDay);
        }

        return from;
    },

    includesDate(date: Date, recurrence: YearlyRecurrence): boolean {
        if (date < recurrence.startDate || (recurrence.endDate && date > recurrence.endDate)) {
            return false;
        }

        if (
            date.getDate() === recurrence.startDate.getDate() &&
            date.getMonth() === recurrence.startDate.getMonth()
        ) {
            return true;
        }

        if (!recurrence.shiftToValidDate) {
            return false;
        }

        // If shiftToValidDate is true, check if the date falls on the last day of the month and the recurrence also started on the last day of its month
        return (
            isLastDayOfMonth(date) &&
            recurrence.startDate.getDate() === 29 &&
            date.getMonth() === recurrence.startDate.getMonth()
        );
    },
};
