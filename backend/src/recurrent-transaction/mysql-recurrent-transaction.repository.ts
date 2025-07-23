import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RecurrentTransaction } from '../common/data-entities/recurrent-transaction';
import { RecurrentTransactionRepository } from './recurrent-transaction-repository.interface';

@Injectable()
export class MysqlRecurrentTransactionRepository implements RecurrentTransactionRepository {
    constructor(
        @InjectRepository(RecurrentTransaction)
        private readonly repo: Repository<RecurrentTransaction>
    ) {}

    async create(entity: RecurrentTransaction, tx?: EntityManager): Promise<RecurrentTransaction> {
        if (tx) {
            return await tx.save(RecurrentTransaction, entity);
        }
        return await this.repo.save(entity);
    }

    async findAll(householdId: string, options?: {isActive?: boolean}, tx?: EntityManager): Promise<RecurrentTransaction[]> {
        const repo = tx ? tx.getRepository(RecurrentTransaction) : this.repo;
        const where: any = { householdId, ...(options?.isActive && { isActive: options.isActive }) };

        return await repo.find({ where });
    }

    async findOne(id: string, householdId: string, tx?: EntityManager): Promise<RecurrentTransaction | null> {
        const repo = tx ? tx.getRepository(RecurrentTransaction) : this.repo;
        return await repo.findOne({ where: { id, householdId, isActive:true } });
    }

    async update(id: string, update: Partial<RecurrentTransaction>, householdId: string, tx?: EntityManager): Promise<RecurrentTransaction | null> {
        const repo = tx ? tx.getRepository(RecurrentTransaction) : this.repo;
        const entity = await repo.findOne({ where: { id, householdId } });
        if (!entity) return null;
        Object.assign(entity, update);
        if (tx) {
            return await tx.save(RecurrentTransaction, entity);
        }
        return await this.repo.save(entity);
    }

    async remove(id: string, householdId: string, tx?: EntityManager): Promise<RecurrentTransaction | null> {
        const repo = tx ? tx.getRepository(RecurrentTransaction) : this.repo;
        const entity = await repo.findOne({ where: { id, householdId } });
        if (!entity) return null;

        if (tx) {
            await tx.remove(RecurrentTransaction, entity);
        } else {
            await this.repo.remove(entity);
        }

        return entity;
    }
}
