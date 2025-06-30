export interface ITransaction {
  id: string;
  householdId: string;
  userId: string;
  categoryId: string;
  recurrenceId?: string;
  amount: number;
  timestamp: Date;
  comment?: string;
  lastUpdated: Date;
}
