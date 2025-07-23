import { Transform } from 'class-transformer';
import { startOfDay } from 'date-fns';

export function NormalizeDate() {
    return Transform(({ value }) => {
        if (!value) return value;
        return startOfDay(new Date(value));
    });
}
