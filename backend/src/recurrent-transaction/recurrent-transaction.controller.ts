import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, UseGuards, Query, ParseBoolPipe } from '@nestjs/common';
import { RecurrentTransactionService } from './recurrent-transaction.service';
import { RecurrentTransaction } from '../common/data-entities/recurrent-transaction';
import { AuthGuard } from '../common/auth/auth.guard';
import { HouseholdId } from '../common/auth/household-id.decorator';

@UseGuards(AuthGuard)
@Controller('recurrent-transaction')
export class RecurrentTransactionController {
    constructor(private readonly service: RecurrentTransactionService) {}

    @Post()
    async create(
        @Body() entity: RecurrentTransaction,
        @HouseholdId() householdId: string
    ): Promise<RecurrentTransaction> {
        if (entity.householdId && entity.householdId !== householdId) {
            throw new NotFoundException('Household ID mismatch');
        }

        return await this.service.create(entity);
    }

    @Get()
    async findAll(
        @HouseholdId() householdId: string,
        @Query('isActive', ParseBoolPipe) isActive?: boolean
    ): Promise<RecurrentTransaction[]> {        
        return await this.service.findAll(householdId, { isActive });
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
        @HouseholdId() householdId: string
    ): Promise<RecurrentTransaction> {
        const entity = await this.service.findOne(id, householdId);
        if (!entity) throw new NotFoundException('RecurrentTransaction not found');
        return entity;
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() update: Partial<RecurrentTransaction>,
        @HouseholdId() householdId: string
    ): Promise<RecurrentTransaction> {
        if (update.householdId && update.householdId !== householdId) {
            throw new NotFoundException('Household ID mismatch');
        }
        const updated = await this.service.update(id, update, householdId);
        if (!updated) throw new NotFoundException('RecurrentTransaction not found');
        return updated;
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @HouseholdId() householdId: string,
        @Query('removeTransactions') removeTransactions: boolean = false
    ): Promise<RecurrentTransaction> {
        const deleted = await this.service.remove(id, householdId, removeTransactions);
        if (!deleted) throw new NotFoundException('RecurrentTransaction not found');
        return deleted;
    }

    @Put(':id/update-dates')
    async updateDatesNotInclude(
        @Param('id') id: string,
        @Body() body: { startDate?: string; endDate?: string },
        @HouseholdId() householdId: string
    ): Promise<RecurrentTransaction> {
        const { startDate, endDate } = body;
        if (!startDate && !endDate) {
            throw new NotFoundException('Must provide at least startDate or endDate');
        }

        let start: Date | undefined = startDate ? new Date(startDate) : undefined;
        let end: Date | undefined = endDate ? new Date(endDate) : undefined;

        if (start && end && start > end) {
            throw new NotFoundException('startDate must be less than or equal to endDate');
        }
        const updated = await this.service.updateDatesNotInclude(id, householdId, start, end);
        if (!updated) throw new NotFoundException('RecurrentTransaction not found');
        return updated;
    }
}