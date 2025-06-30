import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurrentTransaction } from '../common/data-entities/recurrent-transaction';

@Injectable()
export class MysqlRecurrentTransactionRepository {
    constructor(
        @InjectRepository(RecurrentTransaction)
        private readonly repo: Repository<RecurrentTransaction>
    ) {}

    async create(entity: RecurrentTransaction): Promise<RecurrentTransaction> {
        return await this.repo.save(entity);
    }

    async findAll(householdId: string, options?: {isActive?: boolean}): Promise<RecurrentTransaction[]> {
        const where: any = { householdId, ...(options?.isActive && { active: options.isActive }) };

        return await this.repo.find({ where });
    }

    async findOne(id: string, householdId: string): Promise<RecurrentTransaction | null> {
        return await this.repo.findOne({ where: { id, householdId } });
    }

    async update(id: string, update: Partial<RecurrentTransaction>, householdId: string): Promise<RecurrentTransaction | null> {
        const entity = await this.repo.findOne({ where: { id, householdId } });
        if (!entity) return null;
        Object.assign(entity, update);
        return await this.repo.save(entity);
    }

    async remove(id: string, householdId: string): Promise<RecurrentTransaction | null> {
        const entity = await this.repo.findOne({ where: { id, householdId } });
        if (!entity) return null;
        await this.repo.remove(entity);
        return entity;
    }
}
