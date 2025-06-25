import { Category } from '../data-entities/category';

export interface CategoryRepository {
    create(category: Category): Category;
    findAll(householdId: string): Category[];
    findOne(id: string, householdId: string): Category | undefined;
    update(id: string, update: Partial<Category>, householdId: string): Category | undefined;
    remove(id: string, householdId: string): Category | undefined;
}
