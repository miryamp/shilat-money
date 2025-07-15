import { Inject, Injectable } from '@nestjs/common';
import { RecurrentTransaction } from '../common/data-entities/recurrent-transaction';
import { RecurrentTransactionRepository } from './recurrent-transaction-repository.interface';
import { TransactionalDataSource } from './transactional-data-source.interface';
import { Transaction } from '../common/data-entities/transaction';
import { TransactionRepository } from '../transaction/transaction-repository.interface';
import { RecurrenceStrategiesUtils } from './recurrence-strategy/recurrence-strategies.utils';

@Injectable()
export class RecurrentTransactionService {
    constructor(
        @Inject('RecurrentTransactionRepo')
        private readonly repo: RecurrentTransactionRepository,
        @Inject('TransactionRepo')
        private readonly transactionRepo: TransactionRepository,
        @Inject('TransactionalDataSource')
        private readonly dataSource: TransactionalDataSource,
    ) { }

    async create(entity: RecurrentTransaction): Promise<RecurrentTransaction> {
        return await this.dataSource.transaction(async manager => {
            const created = await this.repo.create(entity, manager);
            // After creating the recurrent transaction, create all past instances up to today
            const today = new Date();
            if (entity.startDate && entity.startDate <= today) {
                const pastInstances = await this.getInstancesInRange(created, new Date(entity.startDate), today);
                if (pastInstances.length > 0) {
                    await this.transactionRepo.createMany(pastInstances, manager);

                    const latestTimestamp = pastInstances.reduce((max, tx) => tx.timestamp > max ? tx.timestamp : max, pastInstances[0].timestamp);
                    await this.repo.update(created.id, { lastOperated: latestTimestamp }, manager);
                    created.lastOperated = latestTimestamp;
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
            const updated = await this.repo.update(id, update, householdId, manager);
            if (!updated) return null;

            // Update all associated transactions with new recurrence data
            if (update.transactionData && Object.keys(update.transactionData).length > 0) {
                await this.transactionRepo.update(id, update.transactionData, householdId, manager);
            }

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
                // Find transactions to remove
                const findConditions: any = { recurrenceId: id, householdId };
                if (startMovedForward) {
                    findConditions.timestamp = { $lt: newStart };
                }
                if (endMovedBackward) {
                    findConditions.timestamp = findConditions.timestamp
                        ? { ...findConditions.timestamp, $gt: newEnd }
                        : { $gt: newEnd };
                }
                // Query transactions to delete
                let toRemove: string[] = [];
                if (findConditions.timestamp) {
                    // If both conditions, need to merge
                    if (findConditions.timestamp.$lt && findConditions.timestamp.$gt) {
                        // Remove transactions < newStart OR > newEnd
                        const lessThan = await this.transactionRepo.findAll(householdId, { from: undefined, to: newStart, recurrenceId: id });
                        const greaterThan = await this.transactionRepo.findAll(householdId, { from: newEnd, to: undefined, recurrenceId: id });
                        toRemove = [...lessThan.map(t => t.id), ...greaterThan.map(t => t.id)];
                    } else if (findConditions.timestamp.$lt) {
                        toRemove = (await this.transactionRepo.findAll(householdId, { from: undefined, to: newStart, recurrenceId: id })).map(t => t.id);
                    } else if (findConditions.timestamp.$gt) {
                        toRemove = (await this.transactionRepo.findAll(householdId, { from: newEnd, to: undefined, recurrenceId: id })).map(t => t.id);
                    }
                }
                if (toRemove.length > 0) {
                    await this.transactionRepo.removeMany(toRemove, manager, false);
                }
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

                const gapInstances = await this.getInstancesInRange(current, gapFrom, gapTo);
                if (gapInstances && gapInstances.length > 0) {
                    await this.transactionRepo.upsertMany(gapInstances, manager);
                }
            }

            return updated;
        });
    }

    async updateDatesNotInclude(id: string, householdId: string, newStartDate?: Date, newEndDate?: Date): Promise<RecurrentTransaction | null> {
        const current = await this.repo.findOne(id, householdId);
        if (!current) return null;

        const update: Partial<RecurrentTransaction> = {};
        if (newStartDate && newStartDate.getTime() !== current.startDate.getTime()) {
            const actualStartDate = RecurrenceStrategiesUtils.getNextDate(newStartDate, current);
            if (!actualStartDate) {
                await this.remove(id, householdId, true);
                return null;
            }
            update.startDate = actualStartDate;
        }

        if (newEndDate && (!current.endDate || newEndDate.getTime() !== current.endDate.getTime())) {
            const actualStartDate = RecurrenceStrategiesUtils.getPreviousDate(newEndDate, current);
            if (!actualStartDate) {
                await this.remove(id, householdId, true);
                return null;
            }

            update.endDate = actualStartDate;
        }

        return await this.update(id, update, householdId);
    }

    async remove(id: string, householdId: string, removeTransactions = false): Promise<RecurrentTransaction | null> {
        if (!removeTransactions) {
            return await this.repo.remove(id, householdId);
        }

        return await this.dataSource.transaction(async manager => {
            const transactions = await this.transactionRepo.findAll(householdId, { recurrenceId: id });
            const toRemove = transactions.map(t => t.id);

            this.transactionRepo.removeMany(toRemove, householdId, false, manager);

            // Remove the recurrent transaction itself
            const recurrent = await this.repo.findOne(id, householdId);
            if (!recurrent) return null;
            await this.repo.remove(id, householdId, manager);
            return recurrent;
        });
    }

    async getInstancesInRange(recurrence: RecurrentTransaction, from: Date, to: Date): Promise<Transaction[]> {
        if ((recurrence.endDate && recurrence.endDate < from) ||
            (recurrence.startDate && recurrence.startDate > to))
            return [];

        let current = new Date(recurrence.startDate < from ? from : recurrence.startDate);
        const results: Transaction[] = [];

        if (RecurrenceStrategiesUtils.includesDate(current, recurrence)) {
            results.push({
                ...recurrence.transactionData,
                timestamp: current,
                recurrenceId: recurrence.id
            });
        }

        while (current <= to) {
            const nextDate = RecurrenceStrategiesUtils.getNextDate(current, recurrence);
            if (!nextDate || nextDate > to) break;

            results.push({ ...recurrence.transactionData, timestamp: new Date(nextDate), recurrenceId: recurrence.id });
            current = new Date(nextDate);
        }

        return results;
    }
}
