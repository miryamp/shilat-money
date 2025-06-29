export interface IRecurrentTransaction {
  id: string;
  householdId: string;
  transactionData: any;
  type: string;
  startDate: Date;
  endDate?: Date;
  lastOperated?: Date;
  shiftToValidDate: boolean;
  active: boolean;
}
