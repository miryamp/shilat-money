import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecurrenceStrategiesUtils } from '../recurrent-transaction/recurrence-strategy/recurrence-strategies.utils';
import { startOfDay } from 'date-fns';
import { RecurrentTransactionRepository } from '../recurrent-transaction/recurrent-transaction-repository.interface';
import { TransactionRepository } from '../transaction/transaction-repository.interface';
import { HouseholdRepository } from '../household/household-repository.interface';
import { RecurrentTransaction } from '@/common/data-entities/recurrent-transaction';
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
  ) {}
 
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRecurrentTransactions() {
    const today = startOfDay(new Date());
    
    const households = await this.householdRepo.findAll();
    
    for (const household of households) {
      const recurrentTransactions = await this.recurrentTransactionRepo.findAll(household.id, {
        isActive: true,
        startedBefore: today,
        endsAfter: today
      });
      
      for (const recurrentTx of recurrentTransactions) {
        try {
          await this.processRecurrentTransaction(recurrentTx, today);
        } catch (error) {
          console.error(`Failed to process recurrent transaction ${recurrentTx.id} for household ${household.id}:`, error);
        }
      }
    }
  }

  private async processRecurrentTransaction(recurrentTx: RecurrentTransaction, today: Date) {
    const fromDate = recurrentTx.lastOperated || recurrentTx.startDate;
    const nextDate = RecurrenceStrategiesUtils.getNextDate(fromDate, recurrentTx);

    while (nextDate && startOfDay(nextDate).getTime() <= today.getTime()) {
      await this.dataSource.transaction(async manager => {
        await this.transactionRepo.create({
          ...recurrentTx.transactionData,
          timestamp: nextDate,
          recurrenceId: recurrentTx.id
        }, manager);

        await this.recurrentTransactionRepo.update(
          recurrentTx.id,
          { lastOperated: nextDate },
          recurrentTx.householdId,
          manager
        );
      });
    }
  }
}
