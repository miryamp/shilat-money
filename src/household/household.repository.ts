import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Household } from '../common/data-entities/household';

@Injectable()
export class HouseholdRepository {
  constructor(
    @InjectRepository(Household)
    private readonly householdRepo: Repository<Household>,
  ) {}

  async create(household: Partial<Household>): Promise<Household> {
    return this.householdRepo.save(household);
  }

  async findOne(id: string): Promise<Household | null> {
    return this.householdRepo.findOne({ where: { id } });
  }

  async update(id: string, update: Partial<Household>): Promise<Household | null> {
    await this.householdRepo.update(id, update);
    return this.householdRepo.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.householdRepo.delete(id);
  }
}
