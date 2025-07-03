export interface IRecurrentTransaction {
  id: string;
  householdId: string;
  transactionData: any;
  type: string;
  frequency?: number;
  startDate: Date;
  endDate?: Date;
  lastOperated?: Date;
  shiftToValidDate: boolean;
  isActive: boolean;
}
