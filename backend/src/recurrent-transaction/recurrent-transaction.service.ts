import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecurrentTransaction } from '../common/data-entities/recurrent-transaction';
import { MysqlRecurrentTransactionRepository } from './mysql-recurrent-transaction.repository';
import { DataSource } from 'typeorm';
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
        return await this.dataSource.transaction(async manager => {
            const created = await manager.save(RecurrentTransaction, entity);
            // After creating the recurrent transaction, create all past instances up to today
            const today = new Date();
            if (entity.startDate && entity.startDate <= today) {
                const pastInstances = await this.getInstancesInRange(entity.householdId, new Date(entity.startDate), today);
                for (const instance of pastInstances) {
                    await manager.save(Transaction, { ...instance, lastUpdated: new Date() });
                }
            }
            return created;
        });
    }

    async findAll(householdId: string, options?: { isActive?: boolean }): Promise<RecurrentTransaction[]> {
        return await this.repo.findAll(householdId, options);
    }

    async findOne(id: string, householdId: string): Promise<RecurrentTransaction | null> {
        return await this.repo.findOne(id, householdId);
    }

    async update(id: string, update: Partial<RecurrentTransaction>, householdId: string): Promise<RecurrentTransaction | null> {
        // Fetch the current recurrence
        const current = await this.repo.findOne(id, householdId);
        if (!current) return null;

        // Determine if startDate or endDate changed
        const startDateChanged = update.startDate && update.startDate.getTime() !== current.startDate.getTime();
        const endDateChanged = update.endDate && (
            (!current.endDate && update.endDate) ||
            (current.endDate && update.endDate.getTime() !== current.endDate.getTime())
        );

        // If neither changed, just update as usual
        if (!startDateChanged && !endDateChanged) {
            return await this.repo.update(id, update, householdId);
        }

        return await this.dataSource.transaction(async manager => {
            // Update the recurrence
            const updated = await this.repo.update(id, update, householdId);
            if (!updated) return null;

            // Only operate if new date is <= today
            const today = new Date();
            const newStart = update.startDate || current.startDate;
            const newEnd = update.endDate || current.endDate;
            const prevStart = current.startDate;
            const prevEnd = current.endDate;

            const startMovedForward = startDateChanged && newStart > prevStart && newStart <= today;
            const endMovedBackward = endDateChanged && prevEnd && newEnd && newEnd < prevEnd && newEnd <= today;
            
            const startMovedBackward = startDateChanged && newStart < prevStart && newStart <= today;
            const endMovedForward = endDateChanged && newEnd && (!prevEnd || newEnd > prevEnd) && newEnd <= today;
            
            if (startMovedForward || endMovedBackward) {
                // Remove transactions with timestamp < newStart or > newEnd
                const qb = manager.createQueryBuilder()
                    .delete()
                    .from(Transaction)
                    .where("recurrenceId = :id AND householdId = :householdId", { id, householdId });
                if (startMovedForward) {
                    qb.andWhere("timestamp < :newStart", { newStart });
                }
                if (endMovedBackward) {
                    qb.andWhere("timestamp > :newEnd", { newEnd });
                }
                await qb.execute();
            }

            // Add transactions if startDate moved backward or endDate moved forward
            if (startMovedBackward || endMovedForward) {
                let gapFrom = prevStart;
                let gapTo = prevEnd || today;
                if (startMovedBackward) {
                    gapFrom = newStart;
                }
                if (endMovedForward) {
                    gapTo = newEnd;
                }

                const gapInstances = await this.getInstancesInRange(householdId, gapFrom, gapTo);
                if (gapInstances && gapInstances.length > 0) {
                    // Upsert all gapInstances by timestamp (if exists, do nothing)
                    for (const instance of gapInstances) {
                        await manager.createQueryBuilder()
                            .insert()
                            .into(Transaction)
                            .values({ ...instance, lastUpdated: new Date() })
                            .orIgnore() // Only insert if not exists (by unique constraint - recurrenceId, householdId, timestamp)
                            .execute();
                    }
                }
            }

            return updated;
        });
    }

    async remove(id: string, householdId: string, removeTransactions = false): Promise<RecurrentTransaction | null> {
        if (!removeTransactions) {
            return await this.repo.remove(id, householdId);
        }

        return await this.dataSource.transaction(async manager => {
            // Find and remove all transactions with reacurrenceId = id
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

                results.push({ ...recurrence.transactionData, timestamp: new Date(nextDate), recurrenceId: recurrence.id });
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
