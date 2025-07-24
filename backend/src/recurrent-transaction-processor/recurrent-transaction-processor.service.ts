import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecurrenceStrategiesUtils } from '../recurrent-transaction/recurrence-strategy/recurrence-strategies.utils';
import { startOfDay } from 'date-fns';
import { RecurrentTransactionRepository } from '../recurrent-transaction/recurrent-transaction-repository.interface';
import { TransactionRepository } from '../transaction/transaction-repository.interface';
import { HouseholdRepository } from '../household/household-repository.interface';
import { RecurrentTransaction } from '../common/data-entities/recurrent-transaction';
import { TransactionalDataSource } from '../recurrent-transaction/transactional-data-source.interface';

interface ProcessingOptions {
  householdId?: string;
  recurrentTransactionId?: string;
  date?: Date;
}

@Injectable()
export class RecurrentTransactionProcessorService {
  constructor(
    @Inject('RecurrentTransactionRepo')
    private readonly recurrentTransactionRepo: RecurrentTransactionRepository,
    @Inject('TransactionRepo')
    private readonly transactionRepo: TransactionRepository,
    @Inject('HouseholdRepo')
    private readonly householdRepo: HouseholdRepository,
    @Inject('TransactionalDataSource')
    private readonly dataSource: TransactionalDataSource,
  ) { }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRecurrentTransactions() {
    console.log('Starting daily recurrent transactions processing...');
    await this.processWithOptions({});
  }

  async processWithOptions(options: ProcessingOptions) {
    const processingDate = startOfDay(options.date || new Date());
    const households = options.householdId
      ? [await this.householdRepo.findOne(options.householdId)]
      : await this.householdRepo.findAll();

    await Promise.all(households.map(async household => {
      if (!household) return;

      const recurrentTransactions = await this.getRecurrentTransactions(household.id, processingDate, options.recurrentTransactionId);
      if (!recurrentTransactions.length) return;

      const BATCH_SIZE = 5;
      for (let i = 0; i < recurrentTransactions.length; i += BATCH_SIZE) {
        const batch = recurrentTransactions.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async recurrentTx => {
          try {
            await this.processRecurrentTransaction(recurrentTx, processingDate);
          } catch (error) {
            console.error(`Failed to process recurrent transaction ${recurrentTx.id} for household ${household.id}:`, error);
          }
        }));
      }
    }));
  }

  private async getRecurrentTransactions(householdId: string, processingDate: Date, recurrentTransactionId?: string): Promise<RecurrentTransaction[]> {
    if (recurrentTransactionId) {
      const recurrentTransaction = await this.recurrentTransactionRepo.findOne(recurrentTransactionId, householdId);
      if (recurrentTransaction?.isActive && recurrentTransaction.startDate <= processingDate && (!recurrentTransaction.endDate || recurrentTransaction.endDate >= processingDate)) {
        return [recurrentTransaction];
      }
      console.warn(`Recurrent transaction ${recurrentTransactionId} is not active or does not match the date criteria for household ${householdId}`);
      return [];
    }

    return this.recurrentTransactionRepo.findAll(householdId, {
      isActive: true,
      startedBefore: processingDate,
      endsAfter: processingDate
    });
  }

  private async processRecurrentTransaction(recurrentTx: RecurrentTransaction, today: Date) {
    const datesToProcess = this.getDatesByRecurrence(recurrentTx, today);
    if (datesToProcess.length === 0) return;
    await this.saveRecurrentTransactions(recurrentTx, datesToProcess);
  }

  private getDatesByRecurrence(recurrentTx: RecurrentTransaction, today: Date): Date[] {
    const fromDate = recurrentTx.lastOperated || recurrentTx.startDate;
    let currentDate = RecurrenceStrategiesUtils.getNextDate(fromDate, recurrentTx);
    const datesToProcess: Date[] = [];

    while (currentDate && startOfDay(currentDate).getTime() <= today.getTime()) {
      datesToProcess.push(currentDate);
      currentDate = RecurrenceStrategiesUtils.getNextDate(currentDate, recurrentTx);
    }

    return datesToProcess;
  }

  private async saveRecurrentTransactions(recurrentTx: RecurrentTransaction, dates: Date[]) {
    await this.dataSource.transaction(async manager => {
      const transactions = dates.map(date => ({
        ...recurrentTx.transactionData,
        timestamp: date,
        recurrenceId: recurrentTx.id
      }));

      if (dates.length == 1) { // more efficeint to use create for single transaction
        await this.transactionRepo.create(transactions[0], { skipIfExists: true }, manager);
      } else {
        await this.transactionRepo.createMany(transactions, { skipIfExists: true }, manager);
      }

      await this.recurrentTransactionRepo.update(
        recurrentTx.id,
        { lastOperated: dates[dates.length - 1] },
        recurrentTx.householdId,
        manager
      );
    });
  }
}
