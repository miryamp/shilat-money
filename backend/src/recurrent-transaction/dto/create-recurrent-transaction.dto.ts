import { IRecurrentTransaction } from 'shared/entities/recurrent-transaction.interface';
import { IsString, IsOptional, IsBoolean, IsDateString, IsInt, ValidateNested, IsEnum, Min, IsISO8601, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { RecurrentTransactionType } from 'shared/entities/recurrent-transaction-type.enum';
import { CreateTransactionDto } from '../../transaction/dto/create-transaction.dto';

export class CreateRecurrentTransactionDto implements Omit<IRecurrentTransaction, 'id'> {
    @IsString()
    householdId: string;

    @ValidateNested()
    @Type(() => CreateTransactionDto)
    transactionData: CreateTransactionDto;

    @IsEnum(RecurrentTransactionType)
    type: RecurrentTransactionType;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    frequency?: number;

    @Type(() => Date)
    @IsDate()
    startDate: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    endDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    lastOperated?: Date;

    @IsBoolean()
    @Type(() => Boolean)
    shiftToValidDate: boolean = false;

    @IsBoolean()
    isActive: boolean;
}
