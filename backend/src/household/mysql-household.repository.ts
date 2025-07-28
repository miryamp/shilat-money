import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Household } from '../common/data-entities/household';
import { HouseholdRepository } from './household-repository.interface';

@Injectable()
export class MysqlHouseholdRepository implements HouseholdRepository {
  constructor(
    @InjectRepository(Household)
    private readonly householdRepo: Repository<Household>,
  ) {}

  async create(household: Partial<Household>, entityManager?: EntityManager): Promise<Household> {
    const repo = entityManager ? entityManager.getRepository(Household) : this.householdRepo;
    return repo.save(household);
  }

  async findOne(id: string): Promise<Household | null> {
    return this.householdRepo.findOne({ where: { id } });
  }

    findAll(): Promise<Household[]> {
    return this.householdRepo.find();
  }

  async update(id: string, update: Partial<Household>): Promise<Household | null> {
    await this.householdRepo.update(id, update);
    return this.householdRepo.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.householdRepo.delete(id);
  }
}
