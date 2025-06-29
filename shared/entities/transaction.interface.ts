export interface ITransaction {
  id: string;
  householdId: string;
  userId: string;
  categoryId: string;
  reacurrenceId?: string;
  amount: number;
  timestamp: Date;
  comment?: string;
  lastUpdated: Date;
}
