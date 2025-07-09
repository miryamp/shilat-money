import { addDays, addMonths, addYears, getDate, getMonth, getYear } from 'date-fns';

export function getLastValidDailyDate(start: Date, end: Date, interval: number) {
  const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const steps = Math.floor(diff / interval);
  return addDays(start, (steps * interval));
}

export function getValidMonthlyDate(start: Date, target: Date) {
  const day = getDate(start);
  const year = getYear(target);
  const month = getMonth(target);
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDay));
}

export function getValidYearlyDate(start: Date, target: Date) {
  const day = getDate(start);
  const month = getMonth(start);
  const year = getYear(target);
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDay));
}
