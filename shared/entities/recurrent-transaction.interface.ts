import { RecurrentTransactionType } from "./recurrent-transaction-type.enum";

export interface IRecurrentTransaction {
  id: string;
  householdId: string;
  transactionData: any;
  type: RecurrentTransactionType;
  frequency?: number;
  startDate: Date;
  endDate?: Date;
  lastOperated?: Date;
  shiftToValidDate: boolean;
  isActive: boolean;
}
