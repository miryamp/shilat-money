import { ValueTransformer } from 'typeorm';

const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

export const dateToDaysTransformer: ValueTransformer = {
    to: (date: Date): number | null => {
        return date ? Math.floor(date.getTime() / DAY_IN_MILLISECONDS) : null;
    },
    from: (value: number): Date | null => {
        return value ? new Date(value * DAY_IN_MILLISECONDS) : null;
    }
};
