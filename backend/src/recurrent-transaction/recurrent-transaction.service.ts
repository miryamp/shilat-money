import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecurrentTransaction } from '../common/data-entities/recurrent-transaction';
import { MysqlRecurrentTransactionRepository } from './mysql-recurrent-transaction.repository';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from '../common/data-entities/transaction';
import { RecurrentTransactionType } from 'shared/dist/entities/recurrent-transaction-type.enum';

@Injectable()
export class RecurrentTransactionService {
    constructor(
        @Inject('RecurrentTransactionRepo')
        private readonly repo: MysqlRecurrentTransactionRepository,
        private readonly dataSource: DataSource
    ) { }

    async create(entity: RecurrentTransaction): Promise<RecurrentTransaction> {
        return await this.repo.create(entity);
    }

    async findAll(householdId: string, options?: { isActive?: boolean }): Promise<RecurrentTransaction[]> {
        return await this.repo.findAll(householdId, options);
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
            // Find and remove all transactions with recurrenceId = id
            const transactions = await manager.find(Transaction, { where: { recurrenceId: id, householdId } });
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

    async getInstancesInRange(householdId: string, from: Date, to: Date): Promise<Transaction[]> {
        const recurrences = await this.findAll(householdId, { isActive: true });
        const results: Transaction[] = [];

        for (const recurrence of recurrences) {
            if ((recurrence.endDate && recurrence.endDate > to) ||
                (recurrence.startDate && recurrence.startDate < from))
                continue;

            let current = new Date(recurrence.startDate);
            while (current <= to) {
                const nextDate = this.getNextOperationDate(recurrence, current);
                if (!nextDate || nextDate > to) break;
                
                results.push({...recurrence.transactionData, timestamp: new Date(nextDate), recurrenceId: recurrence.id});
                current = new Date(nextDate); 
            }
        }
        return results;
    }

    getNextOperationDate(recurrence: RecurrentTransaction, lastOperated: Date): Date | null {
        if (!recurrence.active) return null;
        let next = new Date(lastOperated);
        switch (recurrence.type) {
            case RecurrentTransactionType.Daily:
                next.setDate(next.getDate() + (recurrence.frequency || 1));
                break;
            case RecurrentTransactionType.Monthly:
                {
                    const originalDay = next.getDate();
                    next.setMonth(next.getMonth() + 1);
                    if (recurrence.shiftToValidDate && next.getDate() < originalDay) {
                        next = new Date(next.getFullYear(), next.getMonth() + 1, 0);
                    }
                }
                break;
            case RecurrentTransactionType.Yearly:
                {
                    const originalMonth = next.getMonth();
                    const originalDay = next.getDate();
                    next.setFullYear(next.getFullYear() + 1);
                    // If shiftToValidDate and the new date is not the same month or day, set to last day of the original month
                    if (recurrence.shiftToValidDate && (next.getMonth() !== originalMonth || next.getDate() < originalDay)) {
                        next = new Date(next.getFullYear(), originalMonth + 1, 0);
                    }
                }
                break;
            default:
                return null;
        }
        if (recurrence.endDate && next > recurrence.endDate) return null;
        if (next < recurrence.startDate) return new Date(recurrence.startDate);
        return next;
    }
}
