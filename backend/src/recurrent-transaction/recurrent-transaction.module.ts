import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RecurrentTransaction } from '../common/data-entities/recurrent-transaction';
import { Transaction } from '../common/data-entities/transaction';
import { MysqlRecurrentTransactionRepository } from './mysql-recurrent-transaction.repository';
import { MysqlTransactionRepository } from '../transaction/mysql-transaction.repository';
import { RecurrentTransactionService } from './recurrent-transaction.service';
import { RecurrentTransactionController } from './recurrent-transaction.controller';
import { Category } from '../common/data-entities/category';

@Module({
    imports: [
        TypeOrmModule.forFeature([RecurrentTransaction, Transaction, Category]),
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
        RecurrentTransactionService
    ],
    controllers: [RecurrentTransactionController],
    exports: [
        RecurrentTransactionService,
        'RecurrentTransactionRepo',
        'TransactionalDataSource'
    ]
})
export class RecurrentTransactionModule { }
