import { Transform } from 'class-transformer';
import { startOfDay } from 'date-fns';

export function transformDate(value: Date | string): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return startOfDay(date);
}
export function NormalizeDate() {
    return Transform(({ value }) => {
        return transformDate(value);
    });
}
