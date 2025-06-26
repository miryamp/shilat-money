import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '../common/auth/auth.guard';
import { Category } from '../common/data-entities/category';
import { CategoryService } from './category.service';
import { HouseholdId } from '../common/auth/household-id.decorator';

@UseGuards(AuthGuard)
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
    async findAll(@HouseholdId() householdId: string): Promise<Category[]> {
        return await this.categoryService.findAll(householdId);
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
    async remove(@Param('id') id: string, @HouseholdId() householdId: string): Promise<Category> {
        const deleted = await this.categoryService.remove(id, householdId);
        if (!deleted) {
            throw new NotFoundException('Category not found');
        }
        return deleted;
    }
}
