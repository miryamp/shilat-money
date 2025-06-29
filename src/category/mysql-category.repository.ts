import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../common/data-entities/category';
import { CategoryRepository } from './category-repository.interface';

@Injectable()
export class MysqlCategoryRepository implements CategoryRepository {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>
    ) { }

    async create(category: Category): Promise<Category> {
        return await this.categoryRepo.save(category);
    }

    async findAll(householdId: string): Promise<Category[]> {
        return await this.categoryRepo.find({ where: { householdId, isDeleted: false } });
    }

    async findOne(id: string, householdId: string): Promise<Category | null> {
        return await this.categoryRepo.findOne({ where: { id, householdId, isDeleted: false } });
    }

    async update(id: string, update: Partial<Category>, householdId: string): Promise<Category | null> {
        const category = await this.categoryRepo.findOne({ where: { id, householdId, isDeleted: false } });
        if (!category) return null;
        Object.assign(category, update);
        return await this.categoryRepo.save(category);
    }

    async remove(id: string, householdId: string): Promise<Category | null> {
        const category = await this.categoryRepo.findOne({ where: { id, householdId, isDeleted: false } });
        if (!category) return null;

        await this.categoryRepo.remove(category);

        return category;
    }

    async logicRemove(id: string, householdId: string): Promise<Category | null> {
        const category = await this.categoryRepo.findOne({ where: { id, householdId, isDeleted: false } });
        if (!category) return null;
        category.isDeleted = true;
        await this.categoryRepo.save(category);

        return category;
    }
}
