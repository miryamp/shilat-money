import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecurrentTransaction } from '../common/data-entities/recurrent-transaction';
import { MysqlRecurrentTransactionRepository } from './mysql-recurrent-transaction.repository';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from '../common/data-entities/transaction';

@Injectable()
export class RecurrentTransactionService {
    constructor(
        @Inject('RecurrentTransactionRepo')
        private readonly repo: MysqlRecurrentTransactionRepository,
        private readonly dataSource: DataSource
    ) {}

    async create(entity: RecurrentTransaction): Promise<RecurrentTransaction> {
        return await this.repo.create(entity);
    }

    async findAll(householdId: string): Promise<RecurrentTransaction[]> {
        return await this.repo.findAll(householdId);
    }

    async findOne(id: string, householdId: string): Promise<RecurrentTransaction | null> {
        return await this.repo.findOne(id, householdId);
    }

    async update(id: string, update: Partial<RecurrentTransaction>, householdId: string): Promise<RecurrentTransaction | null> {
        return await this.repo.update(id, update, householdId);
    }

    async remove(id: string, householdId: string, removeTransactions = false): Promise<RecurrentTransaction | null> {
        if (!removeTransactions) {
            return await this.repo.remove(id, householdId);
        }

        return await this.dataSource.transaction(async manager => {
            // Find and remove all transactions with reacurrenceId = id
            const transactions = await manager.find(Transaction, { where: { reacurrenceId: id, householdId } });
            if (transactions.length > 0) {
                await manager.remove(transactions);
            }
            // Remove the recurrent transaction itself
            const recurrent = await this.repo.findOne(id, householdId);
            if (!recurrent) return null;
            await manager.remove(recurrent);
            return recurrent;
        });
    }
}
