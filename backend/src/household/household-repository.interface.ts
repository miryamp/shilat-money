import { Household } from '../common/data-entities/household';
import { EntityManager } from 'typeorm';

export const HOUSEHOLD_REPOSITORY = 'HouseholdRepo';

export interface HouseholdRepository {
  create(household: Partial<Household>, entityManager?: EntityManager): Promise<Household>;
  findOne(id: string): Promise<Household | null>;
  findAll(): Promise<Household[]>;
  update(id: string, update: Partial<Household>): Promise<Household | null>;
  remove(id: string): Promise<void>;
}
