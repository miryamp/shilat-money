import { RecurrentTransactionType } from "shared/dist/entities/recurrent-transaction-type.enum";
import { FixedBaseRecurrence } from "./base-recurrence.interface";

export interface YearlyRecurrence extends FixedBaseRecurrence {
  type: RecurrentTransactionType.Yearly;
}