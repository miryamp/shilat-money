import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { TransactionModule } from './transaction/transaction.module';
import { RecurrentTransactionModule } from './recurrent-transaction/recurrent-transaction.module';
import { HouseholdModule } from './household/household.module';
import { RecurrentTransactionProcessorModule } from './recurrent-transaction-processor/recurrent-transaction-processor.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    CategoryModule,
    TransactionModule,
    RecurrentTransactionModule,
    HouseholdModule,
    RecurrentTransactionProcessorModule,
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
