import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurrentTransaction } from '../common/data-entities/recurrent-transaction';
import { RecurrentTransactionRepository } from './recurrent-transaction-repository.interface';

@Injectable()
export class MysqlRecurrentTransactionRepository implements RecurrentTransactionRepository {
    constructor(
        @InjectRepository(RecurrentTransaction)
        private readonly repo: Repository<RecurrentTransaction>
    ) {}

    async create(entity: RecurrentTransaction): Promise<RecurrentTransaction> {
        return await this.repo.save(entity);
    }

    async findAll(householdId: string, options?: {isActive?: boolean}): Promise<RecurrentTransaction[]> {
        const where: any = { householdId, ...(options?.isActive && { isActive: options.isActive }) };

        return await this.repo.find({ where });
    }

    async findOne(id: string, householdId: string): Promise<RecurrentTransaction | null> {
        return await this.repo.findOne({ where: { id, householdId, isActive:true } });
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
