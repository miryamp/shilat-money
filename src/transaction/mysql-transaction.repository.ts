import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../common/data-entities/transaction';
import { TransactionRepository } from './transaction-repository.interface';

@Injectable()
export class MysqlTransactionRepository implements TransactionRepository {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepo: Repository<Transaction>
    ) { }

    async create(transaction: Transaction): Promise<Transaction> {
        return await this.transactionRepo.save({ transaction, lastUpdated: new Date() });
    }

    async findAll(householdId: string): Promise<Transaction[]> {
        return await this.transactionRepo.find({ where: { householdId } });
    }

    async findOne(id: string, householdId: string): Promise<Transaction | null> {
        return await this.transactionRepo.findOne({ where: { id, householdId } });
    }

    async update(id: string, update: Partial<Transaction>, householdId: string): Promise<Transaction | null> {
        const transaction = await this.transactionRepo.findOne({ where: { id, householdId } });
        if (!transaction) return null;
        Object.assign(transaction, { ...update, lastUpdated: new Date() });

        return await this.transactionRepo.save(transaction);
    }

    async remove(id: string, householdId: string): Promise<Transaction | null> {
        const transaction = await this.transactionRepo.findOne({ where: { id, householdId } });
        if (!transaction) return null;
        await this.transactionRepo.remove(transaction);
        return transaction;
    }

    async findByDateRange(householdId: string, from: Date, to: Date): Promise<Transaction[]> {
        return await this.transactionRepo.find({
            where: {
                householdId,
                timestamp: Between(from, to)
            }
        });
    }
}

