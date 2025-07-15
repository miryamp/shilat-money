import { YearlyRecurrenceStrategy } from './yearly-recurrence-strategy';
import { YearlyRecurrence } from '../recurrence-types/yearly-recurrence.interface';
import { RecurrentTransactionType } from 'shared/entities/recurrent-transaction-type.enum';

describe('YearlyRecurrenceStrategy', () => {
    it('getNextDate for Feb 29 with shiftToValidDate=true returns Feb 28 in non-leap year', () => {
        const feb29_2024 = new Date('2024-02-29T00:00:00Z'); // leap year
        const recurrence: YearlyRecurrence = {
            startDate: feb29_2024,
            shiftToValidDate: true,
            type: RecurrentTransactionType.Yearly
        };
        const next = YearlyRecurrenceStrategy.getNextDate(feb29_2024, recurrence);
        expect(next).not.toBeNull();
        expect(next!.getFullYear()).toBe(2025);
        expect(next!.getMonth()).toBe(1); // February
        expect(next!.getDate()).toBe(28); // Feb 28, 2025
    });

    it('getNextDate for Feb 29 with shiftToValidDate=false returns the next leap year', () => {
        const feb29_2024 = new Date('2024-02-29T00:00:00Z'); // leap year
        const recurrence: YearlyRecurrence = {
            startDate: feb29_2024,
            shiftToValidDate: false,
            type: RecurrentTransactionType.Yearly
        };
        const next = YearlyRecurrenceStrategy.getNextDate(feb29_2024, recurrence);
        expect(next).not.toBeNull();
        expect(next!.getFullYear()).toBe(2028);
        expect(next!.getMonth()).toBe(1); // February
        expect(next!.getDate()).toBe(29); // Feb 29, 2028
    });

    it('getPreviousDate for Feb 29, 2024 with shiftToValidDate=true returns Feb 28, 2023', () => {
        const feb29_2024 = new Date('2024-02-29T00:00:00Z');
        const recurrence: YearlyRecurrence = {
            startDate: feb29_2024,
            shiftToValidDate: true,
            type: RecurrentTransactionType.Yearly
        };
        const prev = YearlyRecurrenceStrategy.getPreviousDate(feb29_2024, recurrence);
        expect(prev).not.toBeNull();
        expect(prev!.getFullYear()).toBe(2023);
        expect(prev!.getMonth()).toBe(1); // February
        expect(prev!.getDate()).toBe(28); // Feb 28, 2023
    });

    it('getPreviousDate for Dec 31 returns Dec 31 previous year', () => {
        const dec31_2025 = new Date('2025-12-31T00:00:00Z');
        const recurrence: YearlyRecurrence = {
            startDate: dec31_2025,
            shiftToValidDate: false,
            type: RecurrentTransactionType.Yearly
        };
        const prev = YearlyRecurrenceStrategy.getPreviousDate(dec31_2025, recurrence);
        expect(prev).not.toBeNull();
        expect(prev!.getFullYear()).toBe(2024);
        expect(prev!.getMonth()).toBe(11); // December
        expect(prev!.getDate()).toBe(31);
    });

    it('includesDate returns true for startDate', () => {
        const dec31_2025 = new Date('2025-12-31T00:00:00Z');
        const recurrence: YearlyRecurrence = {
            startDate: dec31_2025,
            shiftToValidDate: false,
            type: RecurrentTransactionType.Yearly
        };
        expect(YearlyRecurrenceStrategy.includesDate(dec31_2025, recurrence)).toBe(true);
    });

    it('includesDate returns false for non-matching date', () => {
        const dec31_2025 = new Date('2025-12-31T00:00:00Z');
        const recurrence: YearlyRecurrence = {
            startDate: dec31_2025,
            shiftToValidDate: false,
            type: RecurrentTransactionType.Yearly
        };
        expect(YearlyRecurrenceStrategy.includesDate(new Date('2025-12-30T00:00:00Z'), recurrence)).toBe(false);
    });

    it('includesDate returns true for last day of month if startDate is last day and shiftToValidDate=true', () => {
        const jan31_2025 = new Date('2025-01-31T00:00:00Z');
        const recurrence: YearlyRecurrence = {
            startDate: jan31_2025,
            shiftToValidDate: true,
            type: RecurrentTransactionType.Yearly
        };
        expect(YearlyRecurrenceStrategy.includesDate(new Date('2026-01-31T00:00:00Z'), recurrence)).toBe(true);
    });

    it('getPreviousDate for Feb 29, 2024 with shiftToValidDate=false returns Feb 29, 2020', () => {
        const feb29_2024 = new Date('2024-02-29T00:00:00Z');
        const recurrence: YearlyRecurrence = {
            startDate: feb29_2024,
            shiftToValidDate: false,
            type: RecurrentTransactionType.Yearly
        };
        const prev = YearlyRecurrenceStrategy.getPreviousDate(feb29_2024, recurrence);
        expect(prev).not.toBeNull();
        expect(prev!.getFullYear()).toBe(2020);
        expect(prev!.getMonth()).toBe(1); // February
        expect(prev!.getDate()).toBe(29);
    });

    it('getNextDate for Feb 29, 2000 with shiftToValidDate=false returns Feb 29, 2004', () => {
        const feb29_2000 = new Date('2000-02-29T00:00:00Z');
        const recurrence: YearlyRecurrence = {
            startDate: feb29_2000,
            shiftToValidDate: false,
            type: RecurrentTransactionType.Yearly
        };
        const next = YearlyRecurrenceStrategy.getNextDate(feb29_2000, recurrence);
        expect(next).not.toBeNull();
        expect(next!.getFullYear()).toBe(2004);
        expect(next!.getMonth()).toBe(1); // February
        expect(next!.getDate()).toBe(29);
    });

    it('getPreviousDate for Feb 29, 2000 with shiftToValidDate=false returns Feb 29, 1996', () => {
        const feb29_2000 = new Date('2000-02-29T00:00:00Z');
        const recurrence: YearlyRecurrence = {
            startDate: feb29_2000,
            shiftToValidDate: false,
            type: RecurrentTransactionType.Yearly
        };
        const prev = YearlyRecurrenceStrategy.getPreviousDate(feb29_2000, recurrence);
        expect(prev).not.toBeNull();
        expect(prev!.getFullYear()).toBe(1996);
        expect(prev!.getMonth()).toBe(1); // February
        expect(prev!.getDate()).toBe(29);
    });

    it('getNextDate for Feb 29, 2096 with shiftToValidDate=false returns Feb 29, 2104', () => {
        const feb29_2096 = new Date('2096-02-29T00:00:00Z');
        const recurrence: YearlyRecurrence = {
            startDate: feb29_2096,
            shiftToValidDate: false,
            type: RecurrentTransactionType.Yearly
        };
        const next = YearlyRecurrenceStrategy.getNextDate(feb29_2096, recurrence);
        expect(next).not.toBeNull();
        expect(next!.getFullYear()).toBe(2104);
        expect(next!.getMonth()).toBe(1); // February
        expect(next!.getDate()).toBe(29);
    });

    it('getPreviousDate for Feb 29, 2104 with shiftToValidDate=false returns Feb 29, 2096', () => {
        const feb29_2104 = new Date('2104-02-29T00:00:00Z');
        const recurrence: YearlyRecurrence = {
            startDate: feb29_2104,
            shiftToValidDate: false,
            type: RecurrentTransactionType.Yearly
        };
        const prev = YearlyRecurrenceStrategy.getPreviousDate(feb29_2104, recurrence);
        expect(prev).not.toBeNull();
        expect(prev!.getFullYear()).toBe(2096);
        expect(prev!.getMonth()).toBe(1); // February
        expect(prev!.getDate()).toBe(29);
    });

    it('getNextDate returns null if from is larger than recurrence.endDate', () => {
        const from = new Date('2025-12-31T00:00:00Z');
        const recurrence: YearlyRecurrence = {
            startDate: new Date('2020-12-31T00:00:00Z'),
            endDate: new Date('2025-01-31T00:00:00Z'),
            shiftToValidDate: false,
            type: RecurrentTransactionType.Yearly
        };
        const next = YearlyRecurrenceStrategy.getNextDate(from, recurrence);
        expect(next).toBeNull();
    });

    it('includesDate returns false if date is larger than recurrence.endDate', () => {
        const startDate = new Date('2020-12-31T00:00:00Z');
        const endDate = new Date('2025-01-31T00:00:00Z');
        const recurrence: YearlyRecurrence = {
            startDate,
            endDate,
            shiftToValidDate: false,
            type: RecurrentTransactionType.Yearly
        };
        const testDate = new Date('2025-12-31T00:00:00Z');
        expect(YearlyRecurrenceStrategy.includesDate(testDate, recurrence)).toBe(false);
    });

    it('includesDate returns true for 28.02.2025 when startDate is 29.02.2024 and shiftToValidDate=true', () => {
        const startDate = new Date('2024-02-29T00:00:00Z');
        const recurrence: YearlyRecurrence = {
            startDate,
            shiftToValidDate: true,
            type: RecurrentTransactionType.Yearly
        };
        const testDate = new Date('2025-02-28T00:00:00Z');
        expect(YearlyRecurrenceStrategy.includesDate(testDate, recurrence)).toBe(true);
    });

    it('includesDate returns false for 28.02.2025 when startDate is 29.02.2024 and shiftToValidDate=false', () => {
        const startDate = new Date('2024-02-29T00:00:00Z');
        const recurrence: YearlyRecurrence = {
            startDate,
            shiftToValidDate: false,
            type: RecurrentTransactionType.Yearly
        };
        const testDate = new Date('2025-02-28T00:00:00Z');
        expect(YearlyRecurrenceStrategy.includesDate(testDate, recurrence)).toBe(false);
    });
});
