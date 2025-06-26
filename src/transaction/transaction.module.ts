import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../common/data-entities/transaction';
import { MysqlTransactionRepository } from './mysql-transaction.repository';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction])
    ],
    controllers: [TransactionController],
    providers: [
        TransactionService,
        {
            provide: 'TransactionRepository',
            useClass: MysqlTransactionRepository
        }
    ],
    exports: [TransactionService]
})
export class TransactionModule {}
