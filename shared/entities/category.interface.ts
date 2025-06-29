export interface ICategory {
  id: string;
  householdId: string;
  name: string;
  type: string;
  color: string;
  icon: string;
  isDeleted: boolean;
  fatherId?: string;
}
