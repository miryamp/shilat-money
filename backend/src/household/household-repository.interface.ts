import { Household } from '../common/data-entities/household';

export const HOUSEHOLD_REPOSITORY = 'HouseholdRepo';

export interface HouseholdRepository {
  create(household: Partial<Household>, tx?: any): Promise<Household>;
  findOne(id: string, tx?: any): Promise<Household | null>;
  findAll(tx?: any): Promise<Household[]>;
  update(id: string, update: Partial<Household>, tx?: any): Promise<Household | null>;
  remove(id: string, tx?: any): Promise<void>;
}
