import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../common/data-entities/category';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../common/data-entities/transaction';
import { TransactionRepository } from './transaction-repository.interface';
import { TransactionType } from 'shared/entities/transaction-type.enum';

@Injectable()
export class MysqlTransactionRepository implements TransactionRepository {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepo: Repository<Transaction>,
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>
    ) { }

    async create(transaction: Transaction): Promise<Transaction> {
        if (transaction.categoryId) {
            const category = await this.categoryRepo.findOne({ where: { id: transaction.categoryId, householdId: transaction.householdId, isDeleted: false } });
            if (!category) throw new Error('Category does not exist or is deleted');
        }
        return await this.transactionRepo.save({ ...transaction, lastUpdated: new Date() });
    }

    async findAll(
        householdId: string,
        options?: {
            userId?: string;
            categoryId?: string;
            type?: TransactionType;
            amount?: { gt?: number; gte?: number; lt?: number; lte?: number; eq?: number };
            from?: Date;
            to?: Date;
        }
    ): Promise<Transaction[]> {
        const query = this.transactionRepo.createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.category', 'category')
            .where('transaction.householdId = :householdId', { householdId });

        if (options?.userId) query.andWhere('transaction.userId = :userId', { userId: options.userId });
        if (options?.categoryId) query.andWhere('transaction.categoryId = :categoryId', { categoryId: options.categoryId });
        if (options?.type) query.andWhere('category.type = :type', { type: options.type });

        if (options?.amount) {
            const amountOprations = {'eq': '=', 'gte': '>=', 'gt': '>', 'lte': '<=', 'lt': '<'};
            for (const [op, sign] of Object.entries(amountOprations)) {
                if (options.amount[op] !== undefined) {
                    query.andWhere(`transaction.amount ${sign} :${op}`, { [op]: options.amount[op] });
                }
            }
        }

        if (options?.from) query.andWhere('transaction.timestamp >= :from', { from: options.from });
        if (options?.to) query.andWhere('transaction.timestamp <= :to', { to: options.to });

        return await query.getMany();
    }

    async findOne(id: string, householdId: string): Promise<Transaction | null> {
        return await this.transactionRepo.findOne({ where: { id, householdId } });
    }

    async update(id: string, update: Partial<Transaction>, householdId: string): Promise<Transaction | null> {
        const transaction = await this.transactionRepo.findOne({ where: { id, householdId }, relations: ['category'] });
        if (!transaction) return null;
        if (update.categoryId && update.categoryId !== transaction.categoryId) {
            const category = await this.categoryRepo.findOne({ where: { id: update.categoryId, householdId, isDeleted: false } });
            if (!category) throw new Error('Category does not exist or is deleted');
        }
        Object.assign(transaction, { ...update, lastUpdated: new Date() });

        return await this.transactionRepo.save(transaction);
    }

    async remove(id: string, householdId: string): Promise<Transaction | null> {
        const transaction = await this.transactionRepo.findOne({ where: { id, householdId } });
        if (!transaction) return null;
        await this.transactionRepo.remove(transaction);
        return transaction;
    }
}

