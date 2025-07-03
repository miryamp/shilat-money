import { BaseRecurrence } from "./base-recurrence.interface";

export interface RecurrenceStrategy<T extends BaseRecurrence> {
    getNextDate(from: Date, recurrence: T): Date | null;
    getPreviousDate(from: Date, recurrence: T): Date | null;
    includesDate(date: Date, recurrence: T): boolean;
}
