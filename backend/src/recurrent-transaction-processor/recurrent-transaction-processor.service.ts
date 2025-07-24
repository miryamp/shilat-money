import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecurrenceStrategiesUtils } from '../recurrent-transaction/recurrence-strategy/recurrence-strategies.utils';
import { startOfDay } from 'date-fns';
import { RecurrentTransactionRepository } from '../recurrent-transaction/recurrent-transaction-repository.interface';
import { TransactionRepository } from '../transaction/transaction-repository.interface';
import { HouseholdRepository } from '../household/household-repository.interface';
import { RecurrentTransaction } from '../common/data-entities/recurrent-transaction';
import { TransactionalDataSource } from '../recurrent-transaction/transactional-data-source.interface';

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
    const today = startOfDay(new Date());
    const households = await this.householdRepo.findAll();

    await Promise.all(households.map(async household => {
      const recurrentTransactions = await this.recurrentTransactionRepo.findAll(household.id, {
        isActive: true,
        startedBefore: today,
        endsAfter: today
      });

      const BATCH_SIZE = 5;
      for (let i = 0; i < recurrentTransactions.length; i += BATCH_SIZE) {
        const batch = recurrentTransactions.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async recurrentTx => {
          try {
            await this.processRecurrentTransaction(recurrentTx, today);
          } catch (error) {
            console.error(`Failed to process recurrent transaction ${recurrentTx.id} for household ${household.id}:`, error);
          }
        }));
      }
    }));
  }

  private async processRecurrentTransaction(recurrentTx: RecurrentTransaction, today: Date) {
    const fromDate = recurrentTx.lastOperated || recurrentTx.startDate;
    let currentDate = RecurrenceStrategiesUtils.getNextDate(fromDate, recurrentTx);

    const datesToProcess: Date[] = [];

    while (currentDate && startOfDay(currentDate).getTime() <= today.getTime()) {
      datesToProcess.push(currentDate);
      currentDate = RecurrenceStrategiesUtils.getNextDate(currentDate, recurrentTx);
    }

    if (datesToProcess.length === 0) return;

    await this.dataSource.transaction(async manager => {
      const transactions = datesToProcess.map(date => ({
        ...recurrentTx.transactionData,
        timestamp: date,
        recurrenceId: recurrentTx.id
      }));
      await this.transactionRepo.createMany(transactions, manager);

      await this.recurrentTransactionRepo.update(
        recurrentTx.id,
        { lastOperated: datesToProcess[datesToProcess.length - 1] },
        recurrentTx.householdId,
        manager
      );
    });
  }
}
