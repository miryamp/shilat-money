import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../common/data-entities/transaction';
import { MysqlTransactionRepository } from './mysql-transaction.repository';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Category } from '../common/data-entities/category';
import { MysqlCategoryRepository } from '../category/mysql-category.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction]),
        TypeOrmModule.forFeature([Category])
    ],
    controllers: [TransactionController],
    providers: [
        TransactionService,
        {
            provide: 'TransactionRepo',
            useClass: MysqlTransactionRepository
        },
    ],
    exports: [TransactionService]
})
export class TransactionModule { }
