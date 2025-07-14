import { DailyRecurrenceStrategy } from './daily-recurrence-strategy';
import { DailyRecurrence } from '../recurrence-types/daily-recurrence.interface';
import { RecurrentTransactionType } from 'shared/entities/recurrent-transaction-type.enum';

describe('DailyRecurrenceStrategy', () => {
    const baseDate = new Date('2025-07-01T00:00:00Z');
    const recurrence: DailyRecurrence = {
        startDate: new Date('2025-07-01T00:00:00Z'),
        frequency: 2,
        type: RecurrentTransactionType.Daily
    };

    it('getNextDate returns correct next date', () => {
        const next = DailyRecurrenceStrategy.getNextDate(baseDate, recurrence);
        expect(next?.toISOString()).toBe(new Date('2025-07-03T00:00:00Z').toISOString());
    });

    it('getNextDate returns null if next date is after endDate', () => {
        const recurrenceWithEnd: DailyRecurrence = {
            ...recurrence,
            endDate: new Date('2025-07-02T00:00:00Z'),
        };
        const next = DailyRecurrenceStrategy.getNextDate(baseDate, recurrenceWithEnd);
        expect(next).toBeNull();
    });

    it('getPreviousDate returns correct previous date', () => {
        // Use a date after startDate to ensure previous date is valid
        const testDate = new Date('2025-07-03T00:00:00Z');
        const prev = DailyRecurrenceStrategy.getPreviousDate(testDate, recurrence);
        expect(prev?.toISOString()).toBe(new Date('2025-07-01T00:00:00Z').toISOString());
    });

    it('getPreviousDate returns null if previous date is before startDate', () => {
        const prev = DailyRecurrenceStrategy.getPreviousDate(new Date('2025-07-01T00:00:00Z'), recurrence);
        expect(prev).toBeNull();
    });

    it('includesDate returns true for startDate', () => {
        expect(DailyRecurrenceStrategy.includesDate(new Date('2025-07-01T00:00:00Z'), recurrence)).toBe(true);
    });

    it('includesDate returns true for valid recurrence date', () => {
        expect(DailyRecurrenceStrategy.includesDate(new Date('2025-07-05T00:00:00Z'), recurrence)).toBe(true); // 4 days after start, 2*2
    });

    it('includesDate returns false for non-recurrence date', () => {
        expect(DailyRecurrenceStrategy.includesDate(new Date('2025-07-04T00:00:00Z'), recurrence)).toBe(false);
    });

    it('includesDate returns false for date before startDate', () => {
        expect(DailyRecurrenceStrategy.includesDate(new Date('2025-06-30T00:00:00Z'), recurrence)).toBe(false);
    });

    it('includesDate returns false for date after endDate', () => {
        const recurrenceWithEnd: DailyRecurrence = {
            ...recurrence,
            endDate: new Date('2025-07-09T00:00:00Z'),
        };
        expect(DailyRecurrenceStrategy.includesDate(new Date('2025-07-11T00:00:00Z'), recurrenceWithEnd)).toBe(false);
    });
});
