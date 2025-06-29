import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { HouseholdService } from './household.service';
import { Household } from '../common/data-entities/household';
import { HouseholdId } from '../common/auth/household-id.decorator';
import { AuthGuard } from '../common/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('households')
export class HouseholdController {
  constructor(private readonly householdService: HouseholdService) {}

  @Post()
  create(@Body() data: Partial<Household>) {
    return this.householdService.create(data);
  }

  @Get()
  findOne(@HouseholdId() id: string) {
    return this.householdService.findOne(id);
  }

  @Patch()
  update(@HouseholdId() id: string, @Body() data: Partial<Household>) {
    return this.householdService.update(id, data);
  }

  @Delete()
  remove(@HouseholdId() id: string) {
    return this.householdService.remove(id);
  }
}
