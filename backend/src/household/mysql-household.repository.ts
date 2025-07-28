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

  private getRepository(entityManager?: EntityManager): Repository<Household> {
    return entityManager ? entityManager.getRepository(Household) : this.householdRepo;
  }

  async create(household: Partial<Household>, entityManager?: EntityManager): Promise<Household> {
    const repo = this.getRepository(entityManager);
    return repo.save(household);
  }

  async findOne(id: string, entityManager?: EntityManager): Promise<Household | null> {
    const repo = this.getRepository(entityManager);
    return repo.findOne({ where: { id } });
  }

  async findAll(entityManager?: EntityManager): Promise<Household[]> {
    const repo = this.getRepository(entityManager);
    return repo.find();
  }

  async update(id: string, update: Partial<Household>, entityManager?: EntityManager): Promise<Household | null> {
    const repo = this.getRepository(entityManager);
    await repo.update(id, update);
    return repo.findOne({ where: { id } });
  }

  async remove(id: string, entityManager?: EntityManager): Promise<void> {
    const repo = this.getRepository(entityManager);
    await repo.delete(id);
  }
}
