import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Household } from '../common/data-entities/household';
import { MysqlHouseholdRepository } from './mysql-household.repository';
import { HouseholdRepository } from './household-repository.interface';
import { HouseholdService } from './household.service';
import { HouseholdController } from './household.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Household])],
  providers: [
    {
      provide: 'HouseholdRepo',
      useClass: MysqlHouseholdRepository,
    },
    HouseholdService,
  ],
  controllers: [HouseholdController],
})
export class HouseholdModule {}
