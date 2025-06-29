import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Household } from '../common/data-entities/household';
import { User } from '../common/data-entities/user';
import { MysqlHouseholdRepository } from './mysql-household.repository';
import { HouseholdService } from './household.service';
import { HouseholdController } from './household.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Household]),
TypeOrmModule.forFeature([User])],
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
