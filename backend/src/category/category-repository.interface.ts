import { TransactionType } from 'shared/entities/transaction-type.enum';
import { Category } from '../common/data-entities/category';
import { EntityManager } from 'typeorm';

export const CATEGORY_REPOSITORY = 'CategoryRepo';

export interface CategoryRepository {
    create(category: Partial<Category>, householdId: string, entityManager?: EntityManager): Promise<Category>;
    findAll(householdId: string, options: { fatherId?: string, type?: TransactionType }): Promise<Category[]>;
    findOne(id: string, householdId: string): Promise<Category | null>;
    update(id: string, update: Partial<Category>, householdId: string): Promise<Category | null>;
    logicRemove(id: string, householdId: string): Promise<Category | null>;
    remove(id: string, householdId: string): Promise<Category | null>;
}
