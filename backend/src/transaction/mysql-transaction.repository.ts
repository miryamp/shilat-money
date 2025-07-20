import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../common/data-entities/category';
import { Repository, Between, EntityManager, In } from 'typeorm';
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

    async create(transaction: Transaction, tx?: EntityManager): Promise<Transaction> {
        if (transaction.categoryId) {
            const category = await this.categoryRepo.findOne({ where: { id: transaction.categoryId, householdId: transaction.householdId, isDeleted: false } });
            if (!category) throw new Error('Category does not exist or is deleted');
        }
        if (tx) {
            return await tx.save(Transaction, { ...transaction, lastUpdated: new Date() });
        }
        return await this.transactionRepo.save({ ...transaction, lastUpdated: new Date() });
    }

    async createMany(bulk: Transaction[], tx?: EntityManager): Promise<void> {
        const checkedCategories = new Set<string>();
        for (const transaction of bulk) {
            if (transaction.categoryId && checkedCategories.has(transaction.categoryId)) continue; // Skip if already checked
            const category = await this.categoryRepo.findOne({ where: { id: transaction.categoryId, householdId: transaction.householdId, isDeleted: false } });
            if (!category) throw new Error(`Category does not exist or is deleted for transaction ${transaction.id}`);
            checkedCategories.add(transaction.categoryId);
        }
        const transactionsWithTimestamp = bulk.map(t => ({ ...t, lastUpdated: new Date() }));

        if (tx) {
            await tx.save(Transaction, transactionsWithTimestamp);
        } else {
            await this.transactionRepo.save(transactionsWithTimestamp);
        }
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
            recurrenceId?: string;
        }
    ): Promise<Transaction[]> {
        const query = this.transactionRepo.createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.category', 'category')
            .where('transaction.householdId = :householdId', { householdId });

        if (options?.userId) query.andWhere('transaction.userId = :userId', { userId: options.userId });
        if (options?.categoryId) query.andWhere('transaction.categoryId = :categoryId', { categoryId: options.categoryId });
        if (options?.type) query.andWhere('category.type = :type', { type: options.type });
        if (options?.recurrenceId) query.andWhere('transaction.recurrenceId = :recurrenceId', { recurrenceId: options.recurrenceId });

        if (options?.amount) {
            const amountOprations = { 'eq': '=', 'gte': '>=', 'gt': '>', 'lte': '<=', 'lt': '<' };
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

    async update(id: string, update: Partial<Transaction>, householdId: string, tx?: any): Promise<Transaction | null> {
        const transaction = await this.transactionRepo.findOne({ where: { id, householdId }, relations: ['category'] });
        if (!transaction) return null;
        if (update.categoryId && update.categoryId !== transaction.categoryId) {
            const category = await this.categoryRepo.findOne({ where: { id: update.categoryId, householdId, isDeleted: false } });
            if (!category) throw new Error('Category does not exist or is deleted');
        }
        Object.assign(transaction, { ...update, lastUpdated: new Date() });
        if (tx) {
            return await tx.save(Transaction, transaction);
        }
        return await this.transactionRepo.save(transaction);
    }

    async upsertMany(transactions: Transaction[], tx?: EntityManager): Promise<void> {
        const transactionsWithTimestamp = transactions.map(t => ({ ...t, lastUpdated: new Date() }));
        const repo = tx ? tx.getRepository(Transaction) : this.transactionRepo;

        await repo.createQueryBuilder()
            .insert()
            .into(Transaction)
            .values(transactionsWithTimestamp)
            .orIgnore()
            .execute();
    }

    async remove(id: string, householdId: string, logicalDelete: boolean = true, tx?: any): Promise<Transaction | null> {
        const transaction = await this.transactionRepo.findOne({ where: { id, householdId } });
        if (!transaction) return null;

        if (logicalDelete) {
            const update = { ...transaction, isDeleted: true, lastUpdated: new Date() }
            return tx ? await tx.save(Transaction, update) : await this.transactionRepo.save(update);
        }

        if (tx) {
            await tx.remove(Transaction, transaction);
        } else {
            await this.transactionRepo.remove(transaction);
        }

        return transaction;
    }

    async removeMany(ids: string[], householdId: string, logicalDelete = true, tx?: EntityManager): Promise<void> {
        const transactions = (tx
            ? await tx.find(Transaction, { where: { id: In(ids), householdId } })
            : await this.transactionRepo.find({ where: { id: In(ids), householdId } })).filter(t => !!t);
        if (transactions.length === 0) return; // No transactions to remove

        if (logicalDelete) {
            const updates = transactions.map(t => ({ ...t, isDeleted: true, lastUpdated: new Date() }));
            if (tx) {
                await tx.save(Transaction, updates);
            } else {
                await this.transactionRepo.save(updates);
            }
            return;
        }

        if (tx) {
            await tx.remove(Transaction, transactions);
        } else {
            await this.transactionRepo.remove(transactions);
        }
    }
}

