import { Injectable, Inject } from '@nestjs/common';
import { Transaction } from '../common/data-entities/transaction';
import { TransactionRepository } from './transaction-repository.interface';
import { TransactionType } from 'shared/dist/entities/transaction-type.enum';

@Injectable()
export class TransactionService {
    constructor(
        @Inject('TransactionRepo')
        private readonly transactionRepository: TransactionRepository
    ) {}

    async create(transaction: Transaction): Promise<Transaction> {
        return await this.transactionRepository.create(transaction);
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

    async getBalance(
        householdId: string,
        options: { categoryId?: string; type?: TransactionType } = {}
    ): Promise<number> {
        const transactions = await this.findAll(householdId, {
            categoryId: options.categoryId,
            type: options.type,
        });
        const balance = transactions.reduce((sum, tx) => {
            if (tx.category.type === TransactionType.Income) return sum + tx.amount;
            if (tx.category.type === TransactionType.Outcome) return sum - tx.amount;
            return sum;
        }, 0);
        return balance;
    }
}
