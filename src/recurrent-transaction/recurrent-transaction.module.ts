import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecurrentTransaction } from '../common/data-entities/recurrent-transaction';
import { MysqlRecurrentTransactionRepository } from './mysql-recurrent-transaction.repository';
import { RecurrentTransactionService } from './recurrent-transaction.service';
import { RecurrentTransactionController } from './recurrent-transaction.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([RecurrentTransaction]),
        TypeOrmModule // <-- ensures DataSource is available for injection
    ],
    providers: [
        {
            provide: 'RecurrentTransactionRepository',
            useClass: MysqlRecurrentTransactionRepository
        }
        , RecurrentTransactionService],
    controllers: [RecurrentTransactionController],
    exports: [RecurrentTransactionService]
})
export class RecurrentTransactionModule { }
