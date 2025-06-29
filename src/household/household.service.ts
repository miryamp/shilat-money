import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { HouseholdRepository } from './household-repository.interface';
import { Household } from '../common/data-entities/household';

@Injectable()
export class HouseholdService {
  constructor(
    @Inject('HouseholdRepo')
    private readonly householdRepository: HouseholdRepository,
  ) {}

  create(data: Partial<Household>) {
    return this.householdRepository.create(data);
  }

  async findOne(id: string) {
    const household = await this.householdRepository.findOne(id);
    if (!household) throw new NotFoundException('Household not found');
    return household;
  }

  update(id: string, data: Partial<Household>) {
    return this.householdRepository.update(id, data);
  }

  remove(id: string) {
    return this.householdRepository.remove(id);
  }
}
