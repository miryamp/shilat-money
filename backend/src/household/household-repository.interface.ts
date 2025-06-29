import { Household } from '../common/data-entities/household';

export interface HouseholdRepository {
  create(household: Partial<Household>): Promise<Household>;
  findOne(id: string): Promise<Household | null>;
  update(id: string, update: Partial<Household>): Promise<Household | null>;
  remove(id: string): Promise<void>;
}
