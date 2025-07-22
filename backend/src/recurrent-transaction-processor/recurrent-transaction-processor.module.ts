import { Module } from '@nestjs/common';
import { RecurrentTransactionProcessorService } from './recurrent-transaction-processor.service';
import { DataSource } from 'typeorm';
import { TransactionModule } from '../transaction/transaction.module';
import { RecurrentTransactionModule } from '../recurrent-transaction/recurrent-transaction.module';
import { HouseholdModule } from '../household/household.module';


@Module({
  imports: [
    TransactionModule,
    RecurrentTransactionModule,
    HouseholdModule
  ],

  providers: [
    RecurrentTransactionProcessorService
  ],
})
export class RecurrentTransactionProcessorModule { }
