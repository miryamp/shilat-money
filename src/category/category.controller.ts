import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Category } from '../data-entities/category';
import { CategoryService } from './category.service';
import { HouseholdId } from '../auth/household-id.decorator';

@UseGuards(AuthGuard)
@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post()
    create(@Body() category: Category, @HouseholdId() householdId: string): Category {
        if(category.householdId && category.householdId !== householdId) {
            throw new UnauthorizedException('Household ID mismatch');
        }
        
        return this.categoryService.create(category);
    }

    @Get()
    findAll(@HouseholdId() householdId: string): Category[] {
        return this.categoryService.findAll(householdId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @HouseholdId() householdId: string): Category {
        return this.categoryService.findOne(id, householdId);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() update: Partial<Category>,
        @HouseholdId() householdId: string
    ): Category {
        return this.categoryService.update(id, update, householdId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @HouseholdId() householdId: string): Category {
        return this.categoryService.remove(id, householdId);
    }
}
