import { RecurrentTransactionType } from "shared/dist/entities/recurrent-transaction-type.enum";
import { FixedBaseRecurrence } from "../base-recurrence.interface";

export interface MonthlyRecurrence extends FixedBaseRecurrence {
  type: RecurrentTransactionType.Monthly
}