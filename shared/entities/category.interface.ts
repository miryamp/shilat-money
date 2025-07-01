import { TransactionType } from "./transaction-type.enum";

export interface ICategory {
  id: string;
  householdId: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  isDeleted: boolean;
  fatherId?: string;
}
