import { Injectable, Inject } from '@nestjs/common';
import { Transaction } from '../common/data-entities/transaction';
import { TransactionRepository } from './transaction-repository.interface';

@Injectable()
export class TransactionService {
    constructor(
        @Inject('TransactionRepository')
        private readonly transactionRepository: TransactionRepository
    ) {}

    async create(transaction: Transaction): Promise<Transaction> {
        return await this.transactionRepository.create(transaction);
    }

    async findAll(householdId: string): Promise<Transaction[]> {
        return await this.transactionRepository.findAll(householdId);
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

    async findByDateRange(householdId: string, from: Date, to: Date): Promise<Transaction[]> {
        return await this.transactionRepository.findByDateRange(householdId, from, to);
    }
}
