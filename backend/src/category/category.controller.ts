import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req, UnauthorizedException, NotFoundException, Query } from '@nestjs/common';
import { AuthGuard } from '../common/auth/auth.guard';
import { Category } from '../common/data-entities/category';
import { CategoryService } from './category.service';
import { HouseholdId } from '../common/auth/household-id.decorator';
import { TransactionType } from '../../../shared/entities/transaction-type.enum';
import { AllowSameOrigin } from '../common/auth/allow-same-origin.decorator';

@UseGuards(AuthGuard)
@AllowSameOrigin()
@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post()
    async create(@Body() category: Category, @HouseholdId() householdId: string): Promise<Category> {
        if(category.householdId && category.householdId !== householdId) {
            throw new UnauthorizedException('Household ID mismatch');
        }
        return await this.categoryService.create(category);
    }

    @Get()
    async findAll(
        @HouseholdId() householdId: string,
        @Query('fatherId') fatherId?: string,
        @Query('type') type?: TransactionType,
    ): Promise<Category[]> {
        return await this.categoryService.findAll(householdId, { fatherId, type });
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @HouseholdId() householdId: string): Promise<Category> {
        const category = await this.categoryService.findOne(id, householdId);
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() update: Partial<Category>,
        @HouseholdId() householdId: string
    ): Promise<Category> {
        const updated = await this.categoryService.update(id, update, householdId);
        if (!updated) {
            throw new NotFoundException('Category not found');
        }
        return updated;
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @HouseholdId() householdId: string,
        @Query('logical') logical: boolean = true
    ): Promise<Category> {
        const deleted = await this.categoryService.remove(id, householdId, logical);
        if (!deleted) {
            throw new NotFoundException('Category not found');
        }
        return deleted;
    }
}
