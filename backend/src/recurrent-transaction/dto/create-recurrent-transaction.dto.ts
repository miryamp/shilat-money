import { IRecurrentTransaction } from 'shared/entities/recurrent-transaction.interface';
import { IsString, IsOptional, IsBoolean, IsDateString, IsInt, ValidateNested, IsEnum, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { RecurrentTransactionType } from 'shared/entities/recurrent-transaction-type.enum';
import { CreateTransactionDto } from '../../transaction/dto/create-transaction.dto';

export class CreateRecurrentTransactionDto implements Omit<IRecurrentTransaction, 'id'> {
  @IsString()
  householdId: string;

  @ValidateNested()
  @Type(() => CreateTransactionDto)
  transactionData: CreateTransactionDto;

  @IsEnum(RecurrentTransactionType)
  @Transform(({ value }) => typeof value === 'string' ? RecurrentTransactionType[value as keyof typeof RecurrentTransactionType] : value)
  type: RecurrentTransactionType;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  frequency?: number;

  @Type(() => Date)
  @IsDateString()
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  lastOperated?: Date;

  @IsBoolean()
  @Type(() => Boolean)
  shiftToValidDate: boolean = false;

  @IsBoolean()
  isActive: boolean;
}
