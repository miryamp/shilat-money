import { RecurrentTransactionType } from "shared/entities/recurrent-transaction-type.enum";
import { BaseRecurrence } from "../recurrence-types/base-recurrence.interface";
import { RecurrenceStrategy } from "./recurrence-strategy";
import { DailyRecurrenceStrategy } from "./daily-recurrence-strategy";
import { MonthlyRecurrenceStrategy } from "./monthly-recurrence-strategy";
import { YearlyRecurrenceStrategy } from "./yearly-recurrence-strategy";

const recurrenceStrategies: {
  [K in RecurrentTransactionType]: RecurrenceStrategy<any>
} = {
  daily: DailyRecurrenceStrategy,
  monthly: MonthlyRecurrenceStrategy,
  yearly: YearlyRecurrenceStrategy
};

function getRecurrenceStrategy(type: RecurrentTransactionType) {
    return recurrenceStrategies[type];
}

export const RecurrenceStrategiesUtils: RecurrenceStrategy<BaseRecurrence> = {
  getNextDate: (from: Date, recurrence: BaseRecurrence): Date | null => {
    return getRecurrenceStrategy(recurrence.type).getNextDate(from, recurrence);
  },
  getPreviousDate: (from: Date, recurrence: BaseRecurrence): Date | null => {
    return getRecurrenceStrategy(recurrence.type).getPreviousDate(from, recurrence);
  },
  includesDate: (date: Date, recurrence: BaseRecurrence): boolean => {
    return getRecurrenceStrategy(recurrence.type).includesDate(date, recurrence);
  }
};