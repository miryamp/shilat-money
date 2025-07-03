import { RecurrenceStrategy } from "./recurrence-strategy";
import { YearlyRecurrence } from "../recurrence-types/yearly-recurrence.interface";

export const YearlyRecurrenceStrategy: RecurrenceStrategy<YearlyRecurrence> = {
    getNextDate(from: Date, recurrence: YearlyRecurrence): Date | null {
        const originalMonth = from.getMonth();
        const originalDay = from.getDate();
        from.setFullYear(from.getFullYear() + 1);

        if (recurrence.endDate && from > recurrence.endDate) {
            return null;
        }

        // If shiftToValidDate and the new date is not the same month or day, set to last day of the original month
        if (recurrence.shiftToValidDate &&
            (from.getMonth() !== originalMonth || from.getDate() < originalDay)) {
            from = new Date(from.getFullYear(), originalMonth + 1, 0);
        }
        return from;
    },

    getPreviousDate(from: Date, recurrence: YearlyRecurrence): Date | null {
        const originalMonth = from.getMonth();
        const originalDay = from.getDate();
        from.setFullYear(from.getFullYear() - 1);

        if (recurrence.shiftToValidDate && 
            (from.getMonth() !== originalMonth || from.getDate() < originalDay)) {
            from = new Date(from.getFullYear(), originalMonth + 1, 0);
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
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const recurrenceLastDayOfMonth = new Date(
            recurrence.startDate.getFullYear(),
            recurrence.startDate.getMonth() + 1,
            0
        ).getDate();

        return (
            date.getDate() === lastDayOfMonth &&
            recurrence.startDate.getDate() === recurrenceLastDayOfMonth &&
            date.getMonth() === recurrence.startDate.getMonth()
        );
    },
};
