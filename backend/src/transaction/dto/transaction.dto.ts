import { IsString, IsOptional, IsNumber, IsDateString, Min, IsISO8601, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionDto {
  @IsOptional()
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  timestamp: Date;

  @IsOptional()
  @IsString()
  comment?: string;
}
