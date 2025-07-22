import { Module } from '@nestjs/common';
import { RecurrentTransactionProcessorService } from './recurrent-transaction-processor.service';
import { RecurrentTransaction } from '@/common/data-entities/recurrent-transaction';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Transaction } from 'typeorm';
import { MysqlRecurrentTransactionRepository } from '@/recurrent-transaction/mysql-recurrent-transaction.repository';
import { MysqlTransactionRepository } from '@/transaction/mysql-transaction.repository';
import { Household } from '@/common/data-entities/household';
import { MysqlHouseholdRepository } from '@/household/mysql-household.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecurrentTransaction]),
    TypeOrmModule.forFeature([Transaction]),
    TypeOrmModule.forFeature([Household]),
    TypeOrmModule
  ],

  providers: [
    {
      provide: 'RecurrentTransactionRepo',
      useClass: MysqlRecurrentTransactionRepository
    },
    {
      provide: 'TransactionRepo',
      useClass: MysqlTransactionRepository
    },
    {
      provide: 'TransactionalDataSource',
      useFactory: (dataSource: DataSource) => dataSource,
      inject: [DataSource]
    },
    {
      provide: 'HouseholdRepo',
      useClass: MysqlHouseholdRepository,
    },
    RecurrentTransactionProcessorService
  ],
})
export class RecurrentTransactionProcessorModule { }
