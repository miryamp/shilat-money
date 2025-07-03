import { RecurrenceStrategy } from "./recurrence-strategy";
import { DailyRecurrence } from "../recurrence-types/daily-recurrence.interface";

export const DailyRecurrenceStrategy: RecurrenceStrategy<DailyRecurrence> = {
    getNextDate(from: Date, recurrence: DailyRecurrence) {
        const next = new Date(from);
        next.setDate(next.getDate() + recurrence.frequency);
        if (recurrence.endDate && next > recurrence.endDate) return null;
        return next;
    },

    getPreviousDate(from: Date, recurrence: DailyRecurrence): Date | null {
        const previous = new Date(from);
        previous.setDate(previous.getDate() - recurrence.frequency);
        if (previous < recurrence.startDate) return null;
        return previous;
    },

    includesDate(date: Date, recurrence: DailyRecurrence): boolean {
        if (date < recurrence.startDate ||
            (recurrence.endDate && date > recurrence.endDate)) {
            return false;
        }

        const diffDays = Math.floor((date.getTime() - recurrence.startDate.getTime())
            / (1000 * 60 * 60 * 24));

        return diffDays % recurrence.frequency === 0;
    }
};
