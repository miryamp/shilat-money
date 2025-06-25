import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Category } from '../data-entities/category';
import { CategoryRepository } from '../interfaces/category-repository.interface';

@Injectable()
export class CategoryService {
    constructor(
        @Inject('CategoryRepository') 
        private readonly categoryRepository: CategoryRepository
    ) {}

    create(category: Category): Category {
        return this.categoryRepository.create(category);
    }

    findAll(householdId: string): Category[] {
        return this.categoryRepository.findAll(householdId);
    }

    findOne(id: string, householdId: string): Category {
        const category = this.categoryRepository.findOne(id, householdId);
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }

    update(id: string, update: Partial<Category>, householdId: string): Category {
        const updated = this.categoryRepository.update(id, update, householdId);
        if (!updated) {
            throw new NotFoundException('Category not found');
        }
        return updated;
    }

    remove(id: string, householdId: string): Category {
        const deleted = this.categoryRepository.remove(id, householdId);
        if (!deleted) {
            throw new NotFoundException('Category not found');
        }
        return deleted;
    }
}
