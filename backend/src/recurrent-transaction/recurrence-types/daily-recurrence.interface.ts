import { RecurrentTransactionType } from "shared/entities/recurrent-transaction-type.enum";
import { BaseRecurrence } from "./base-recurrence.interface";

export interface DailyRecurrence extends BaseRecurrence {
    type: RecurrentTransactionType.Daily;
    frequency: number;
}