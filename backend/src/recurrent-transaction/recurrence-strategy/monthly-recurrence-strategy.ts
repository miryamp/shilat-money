import { RecurrenceStrategy } from "./recurrence-strategy";
import { MonthlyRecurrence } from "../recurrence-types/monthly-recurrence.interface";

export const MonthlyRecurrenceStrategy: RecurrenceStrategy<MonthlyRecurrence> = {
    getNextDate(from: Date, recurrence: MonthlyRecurrence): Date | null {
        const originalDay = from.getDate();
        from.setMonth(from.getMonth() + 1);
        if (recurrence.shiftToValidDate && from.getDate() < originalDay) {
            from = new Date(from.getFullYear(), from.getMonth() + 1, 0);
        }
        return from;
    },

    getPreviousDate: function (from: Date, recurrence: MonthlyRecurrence): Date | null {
        const originalDay = from.getDate();
        from.setMonth(from.getMonth() - 1);
        if (recurrence.shiftToValidDate && from.getDate() < originalDay) {
            from = new Date(from.getFullYear(), from.getMonth() + 1, 0);
        }
        return from;
    },

    includesDate: function (date: Date, recurrence: MonthlyRecurrence): boolean {
        if (date < recurrence.startDate ||
            (recurrence.endDate && date > recurrence.endDate)) {
            return false;
        }

        if (date.getDate() == recurrence.startDate.getDate()) {
            return true;
        }

        if (!recurrence.shiftToValidDate) {
            return false;
        }
        // If shiftToValidDate is true, check if the date falls on the last day of the month
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() +
            1, 0).getDate();

        const recurrenceLastDayOfMonth = new Date(recurrence.startDate.getFullYear(),
            recurrence.startDate.getMonth() + 1, 0).getDate();

        return date.getDate() === lastDayOfMonth && recurrence.startDate.getDate() === recurrenceLastDayOfMonth;
    }
}