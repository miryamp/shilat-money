import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, NotFoundException, UnauthorizedException, Query, ParseDatePipe } from '@nestjs/common';
import { AuthGuard } from '../common/auth/auth.guard';
import { Transaction } from '../common/data-entities/transaction';
import { TransactionService } from './transaction.service';
import { HouseholdId } from '../common/auth/household-id.decorator';
import { UserId } from '../common/auth/user-id.decorator';
import { TransactionType } from 'shared/entities/transaction-type.enum';
import { TransactionDto } from './dto/transaction.dto';
import { plainToInstance } from 'class-transformer';

@UseGuards(AuthGuard)
@Controller('transaction')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }

    @Post()
    async create(
        @Body() transaction: TransactionDto,
        @HouseholdId() householdId: string,
        @UserId() userId: string
    ): Promise<Transaction> {
        if (!transaction.categoryId || typeof transaction.amount !== 'number' || !transaction.timestamp) {
            throw new NotFoundException('Missing required fields: categoryId, amount, timestamp');
        }
        return await this.transactionService.create(plainToInstance(Transaction, { ...transaction, userId }), householdId);
    }

    @Get()
    async findAll(
        @HouseholdId() householdId: string,
        @Query('userId') userId?: string,
        @Query('categoryId') categoryId?: string,
        @Query('amount') amount?: {
            gt?: number;
            gte?: number;
            lt?: number;
            lte?: number;
            eq?: number;
        },
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('type') type?: TransactionType,
    ): Promise<Transaction[]> {
        return await this.transactionService.findAll(householdId, {
            userId,
            categoryId,
            type,
            amount: (amount?.eq || amount?.gte || amount?.gt || amount?.lte || amount?.lt) ? amount : undefined,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
        });
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @HouseholdId() householdId: string): Promise<Transaction> {
        const transaction = await this.transactionService.findOne(id, householdId);
        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }
        return transaction;
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() update: TransactionDto,
        @HouseholdId() householdId: string,
        @UserId() userId: string
    ): Promise<Transaction> {
        const updated = await this.transactionService.update(id, householdId, { ...update, userId });
        if (!updated) {
            throw new NotFoundException('Transaction not found');
        }
        return updated;
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @HouseholdId() householdId: string): Promise<Transaction> {
        const deleted = await this.transactionService.remove(id, householdId);
        if (!deleted) {
            throw new NotFoundException('Transaction not found');
        }
        return deleted;
    }

    @Get('sum')
    async getBalance(
        @HouseholdId() householdId: string,
        @Query('categoryId') categoryId?: string,
        @Query('from', new ParseDatePipe()) from?: Date,
        @Query('to', new ParseDatePipe()) to?: Date,
    ): Promise<number> {
        return await this.transactionService.getSum(householdId, {
            categoryId,
            from,
            to,
        });
    }
}
