import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

/** Bible API 44 — POST /water. Fields: Quantity, Time. */
export class LogWaterDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5000)
  amountMl!: number;

  @IsOptional()
  @IsDateString()
  loggedAt?: string;
}

/** Bible API 45 — GET /water/history. */
export class WaterHistoryQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
