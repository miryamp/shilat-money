import { RecurrentTransactionType } from "shared/entities/recurrent-transaction-type.enum";
import { FixedBaseRecurrence } from "./base-recurrence.interface";

export interface MonthlyRecurrence extends FixedBaseRecurrence {
  type: RecurrentTransactionType.Monthly
}