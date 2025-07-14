import { Inject, Injectable } from '@nestjs/common';
import { RecurrentTransaction } from '../common/data-entities/recurrent-transaction';
import { MysqlRecurrentTransactionRepository } from './mysql-recurrent-transaction.repository';
import { DataSource } from 'typeorm';
import { Transaction } from '../common/data-entities/transaction';
import { getNextRecurrenceDate, getPreviousRecurrenceDate, isDateInRecurrence } from './recurrence-strategy/recurrence-strategies.utils';

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
                const pastInstances = await this.getInstancesInRange(created, new Date(entity.startDate), today);
                if (pastInstances.length > 0) {
                    await manager.createQueryBuilder()
                        .insert()
                        .into(Transaction)
                        .values(pastInstances.map(instance => ({ ...instance, lastUpdated: new Date() })))
                        .execute();

                    const latestTimestamp = pastInstances.reduce((max, tx) => tx.timestamp > max ? tx.timestamp : max, pastInstances[0].timestamp);
                    await manager.update(RecurrentTransaction, created.id, { lastOperated: latestTimestamp });
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
            const updated = await this.repo.update(id, update, householdId);
            if (!updated) return null;

            // Update all associated transactions with new recurrence data
            if (update.transactionData && Object.keys(update.transactionData).length > 0) {
                await manager.createQueryBuilder()
                    .update(Transaction)
                    .set({
                        ...update.transactionData,
                        lastUpdated: new Date()
                    })
                    .where("recurrenceId = :id AND householdId = :householdId", { id, householdId })
                    .execute();
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

                const gapInstances = await this.getInstancesInRange(current, gapFrom, gapTo);
                if (gapInstances && gapInstances.length > 0) {
                    // Upsert all gapInstances by timestamp (if exists, do nothing)
                    await manager.createQueryBuilder()
                        .insert()
                        .into(Transaction)
                        .values(gapInstances.map(instance => ({ ...instance, lastUpdated: new Date() })))
                        .orIgnore() // Only insert if not exists (by unique constraint - recurrenceId, householdId, timestamp)
                        .execute();
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
            const actualStartDate = getNextRecurrenceDate(newStartDate, current);
            if (!actualStartDate) {
                await this.remove(id, householdId, true);
                return null;
            }
            update.startDate = actualStartDate;
        }

        if (newEndDate && (!current.endDate || newEndDate.getTime() !== current.endDate.getTime())) {
            const actualStartDate = getPreviousRecurrenceDate(newEndDate, current);
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
            await manager.delete(Transaction, { where: { recurrenceId: id, householdId } });

            // Remove the recurrent transaction itself
            const recurrent = await this.repo.findOne(id, householdId);
            if (!recurrent) return null;
            await manager.remove(recurrent);
            return recurrent;
        });
    }

    async getInstancesInRange(recurrence: RecurrentTransaction, from: Date, to: Date): Promise<Transaction[]> {
        if ((recurrence.endDate && recurrence.endDate < from) ||
            (recurrence.startDate && recurrence.startDate > to))
            return [];

        let current = new Date(recurrence.startDate < from ? from : recurrence.startDate);
        const results: Transaction[] = [];

        if (isDateInRecurrence(current, recurrence)) {
            results.push({
                ...recurrence.transactionData,
                timestamp: current,
                recurrenceId: recurrence.id
            });
        }

        while (current <= to) {
            const nextDate = getNextRecurrenceDate(current, recurrence);
            if (!nextDate || nextDate > to) break;

            results.push({ ...recurrence.transactionData, timestamp: new Date(nextDate), recurrenceId: recurrence.id });
            current = new Date(nextDate);
        }

        return results;
    }
}
