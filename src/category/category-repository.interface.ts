import { TransactionType } from '../common/data-entities/transaction-type.enum';
import { Category } from '../common/data-entities/category';

export interface CategoryRepository {
    create(category: Category): Promise<Category>;
    findAll(householdId: string, options: { fatherId?: string, type?: TransactionType }): Promise<Category[]>;
    findOne(id: string, householdId: string): Promise<Category | null>;
    update(id: string, update: Partial<Category>, householdId: string): Promise<Category | null>;
    logicRemove(id: string, householdId: string): Promise<Category | null>;
    remove(id: string, householdId: string): Promise<Category | null>;
}
