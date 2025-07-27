import { RecurrentTransactionType } from "./recurrent-transaction-type.enum";
import { ITransactionData } from "./transaction-data.interface";

export interface IRecurrentTransaction {
  id: string;
  householdId: string;
  transactionData: ITransactionData;
  type: RecurrentTransactionType;
  frequency?: number;
  startDate: Date;
  endDate?: Date;
  lastOperated?: Date;
  shiftToValidDate: boolean;
  isActive: boolean;
}
