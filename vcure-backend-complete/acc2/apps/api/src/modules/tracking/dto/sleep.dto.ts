import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class LogSleepDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(24)
  hours!: number;

  @IsString()
  quality!: string;

  @IsOptional()
  @IsDateString()
  bedTime?: string;

  @IsOptional()
  @IsDateString()
  wakeTime?: string;
}
