import { IsOptional, IsBoolean, IsInt, ValidateNested, IsEnum, Min, IsDate, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { RecurrentTransactionType } from 'shared/entities/recurrent-transaction-type.enum';
import { TransactionDto } from '../../transaction/dto/transaction.dto';
import { NormalizeDate } from '../../common/transformers/normalize-date.transformer';

export class RecurrentTransactionDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => TransactionDto)
    transactionData?: TransactionDto;

    @IsOptional()
    @IsEnum(RecurrentTransactionType)
    type?: RecurrentTransactionType;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    frequency?: number;

    @IsOptional()
    @Type(() => Date)
    @NormalizeDate()
    @IsDate()
    startDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @NormalizeDate()
    @IsDate()
    endDate?: Date;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    shiftToValidDate?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive: boolean = true;
}
