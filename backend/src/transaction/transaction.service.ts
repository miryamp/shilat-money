import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Transaction } from '../common/data-entities/transaction';
import { TransactionRepository } from './transaction-repository.interface';
import { TransactionType } from 'shared/dist/entities/transaction-type.enum';
import { CategoryRepository } from '../category/category-repository.interface';
import { calculateTransactionsBalance } from 'shared/dist/utils/transactionBalance';

@Injectable()
export class TransactionService {
    constructor(
        @Inject('TransactionRepo')
        private readonly transactionRepository: TransactionRepository,
        @Inject('CategoryRepo')
        private readonly categoryRepository: CategoryRepository
    ) { }

    async create(transaction: Transaction): Promise<Transaction> {
        return await this.transactionRepository.create(transaction);
    }

    async findAll(
        householdId: string,
        options?: {
            userId?: string;
            categoryId?: string | string[];
            type?: TransactionType;
            amount?: { gt?: number; gte?: number; lt?: number; lte?: number; eq?: number };
            from?: Date;
            to?: Date;
        }
    ): Promise<Transaction[]> {
        return await this.transactionRepository.findAll(householdId, options);
    }

    async findOne(id: string, householdId: string): Promise<Transaction | null> {
        return await this.transactionRepository.findOne(id, householdId);
    }

    async update(id: string, update: Partial<Transaction>, householdId: string): Promise<Transaction | null> {
        return await this.transactionRepository.update(id, update, householdId);
    }

    async remove(id: string, householdId: string): Promise<Transaction | null> {
        return await this.transactionRepository.remove(id, householdId);
    }

    async getSum(
        householdId: string,
        options: { categoryId?: string; from?: Date; to?: Date } = {}
    ): Promise<number> {
        let categoryIds: string[] | undefined = undefined;
        if (options.categoryId) {
            const subcategories = await this.categoryRepository.findAll(householdId, { fatherId: options.categoryId });
            categoryIds = [options.categoryId, ...subcategories.map(cat => cat.id)];
        }

        const transactions = await this.findAll(householdId, {
            categoryId: categoryIds,
            from: options.from,
            to: options.to,
        });

        return calculateTransactionsBalance(transactions.map(t => ({
            amount: t.amount,
            type: t.category.type
        })));
    }
}
