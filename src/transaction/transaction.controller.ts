import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../common/auth/auth.guard';
import { Transaction } from '../common/data-entities/transaction';
import { TransactionService } from './transaction.service';
import { HouseholdId } from '../common/auth/household-id.decorator';

@UseGuards(AuthGuard)
@Controller('transaction')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Post()
    async create(@Body() transaction: Transaction, @HouseholdId() householdId: string): Promise<Transaction> {
        if (transaction.householdId && transaction.householdId !== householdId) {
            throw new UnauthorizedException('Household ID mismatch');
        }
        return await this.transactionService.create(transaction);
    }

    @Get()
    async findAll(@HouseholdId() householdId: string): Promise<Transaction[]> {
        return await this.transactionService.findAll(householdId);
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
        @Body() update: Partial<Transaction>,
        @HouseholdId() householdId: string
    ): Promise<Transaction> {
        const updated = await this.transactionService.update(id, update, householdId);
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
}
