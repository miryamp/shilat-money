import { MonthlyRecurrenceStrategy } from './monthly-recurrence-strategy';
import { MonthlyRecurrence } from '../recurrence-types/monthly-recurrence.interface';
import { RecurrentTransactionType } from 'shared/entities/recurrent-transaction-type.enum';

describe('MonthlyRecurrenceStrategy', () => {
    const baseDate29 = new Date('2025-01-29T00:00:00Z');
    const feb2025 = new Date('2025-02-28T00:00:00Z'); // 2025 is not a leap year

    const recurrence29_shift: MonthlyRecurrence = {
        startDate: baseDate29,
        type: RecurrentTransactionType.Monthly,
        shiftToValidDate: true
    };

    const recurrence29_noshift: MonthlyRecurrence = {
        startDate: baseDate29,
        type: RecurrentTransactionType.Monthly,
        shiftToValidDate: false
    };

    it('getNextDate for 29th with shiftToValidDate=true goes to last day of Feb', () => {
        const next = MonthlyRecurrenceStrategy.getNextDate(baseDate29, recurrence29_shift);
        expect(next).not.toBeNull();
        expect(next!.getMonth()).toBe(1); // February
        expect(next!.getDate()).toBe(28); // Feb 28, 2025
    });

    it('getNextDate for 29th with shiftToValidDate=false returns March 29', () => {
        const next = MonthlyRecurrenceStrategy.getNextDate(baseDate29, recurrence29_noshift);
        expect(next).not.toBeNull();
        expect(next!.getMonth()).toBe(2); // March
        expect(next!.getDate()).toBe(29); // March 29, 2025
    });

    it('getPreviousDate for March 29th with shiftToValidDate=true returns Feb 28', () => {
        const march29 = new Date('2025-03-29T00:00:00Z');
        const prev = MonthlyRecurrenceStrategy.getPreviousDate(march29, recurrence29_shift);
        expect(prev).not.toBeNull();
        expect(prev!.getMonth()).toBe(1); // February
        expect(prev!.getDate()).toBe(28); // Feb 28, 2025
    });

    it('getPreviousDate for March 29th with shiftToValidDate=false returns January 29', () => {
        const march29 = new Date('2025-03-29T00:00:00Z');
        const prev = MonthlyRecurrenceStrategy.getPreviousDate(march29, recurrence29_noshift);
        expect(prev).not.toBeNull();
        expect(prev!.getMonth()).toBe(0); // January
        expect(prev!.getDate()).toBe(29); // January 29, 2025
    });

    it('includesDate returns true for last day of Feb if startDate is 29th and shiftToValidDate=true', () => {
        expect(MonthlyRecurrenceStrategy.includesDate(feb2025, recurrence29_shift)).toBe(true);
    });

    it('includesDate returns false for last day of Feb if startDate is 29th and shiftToValidDate=false', () => {
        expect(MonthlyRecurrenceStrategy.includesDate(feb2025, recurrence29_noshift)).toBe(false);
    });

    // Additional cases
    it('includesDate returns true for startDate', () => {
        expect(MonthlyRecurrenceStrategy.includesDate(baseDate29, recurrence29_shift)).toBe(true);
        expect(MonthlyRecurrenceStrategy.includesDate(baseDate29, recurrence29_noshift)).toBe(true);
    });

    it('includesDate returns false for date before startDate', () => {
        expect(MonthlyRecurrenceStrategy.includesDate(new Date('2024-12-29T00:00:00Z'), recurrence29_shift)).toBe(false);
    });

    it('includesDate returns false for date after endDate', () => {
        const recurrenceWithEnd = { ...recurrence29_shift, endDate: new Date('2025-03-29T00:00:00Z') };
        expect(MonthlyRecurrenceStrategy.includesDate(new Date('2025-04-29T00:00:00Z'), recurrenceWithEnd)).toBe(false);
    });
});
