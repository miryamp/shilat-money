import { IsString, IsOptional, IsNumber, IsDateString, Min, IsISO8601, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsString()
  householdId: string;

  @IsString()
  userId: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  recurrenceId?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @Type(() => Date)
  @IsDate()
  timestamp: Date;

  @IsOptional()
  @IsString()
  comment?: string;

  @Type(() => Date)
  @IsDate()
  lastUpdated: Date;
}
