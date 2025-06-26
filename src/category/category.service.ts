import { Injectable, Inject } from '@nestjs/common';
import { Category } from '../common/data-entities/category';
import { CategoryRepository } from './category-repository.interface';

@Injectable()
export class CategoryService {
    constructor(
        @Inject('CategoryRepository') 
        private readonly categoryRepository: CategoryRepository
    ) {}

    async create(category: Category): Promise<Category> {
        if (category.fatherId && category.fatherId === category.id) {
            throw new Error('Category cannot be its own father');
        }
        return await this.categoryRepository.create(category);
    }

    async findAll(householdId: string): Promise<Category[]> {
        return await this.categoryRepository.findAll(householdId);
    }

    async findOne(id: string, householdId: string): Promise<Category | null> {
        return await this.categoryRepository.findOne(id, householdId);
    }

    async update(id: string, update: Partial<Category>, householdId: string): Promise<Category | null> {
        if (update.fatherId && update.fatherId === id) {
            throw new Error('Category cannot be its own father');
        }
        return await this.categoryRepository.update(id, update, householdId);
    }

    async remove(id: string, householdId: string): Promise<Category | null> {
        return await this.categoryRepository.remove(id, householdId);
    }
}
