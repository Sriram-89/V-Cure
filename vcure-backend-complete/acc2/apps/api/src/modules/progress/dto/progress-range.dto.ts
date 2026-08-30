import { IsIn, IsOptional } from 'class-validator';
import { DateRangePreset } from '../types/progress.type';

export const DATE_RANGE_PRESETS = ['7D', '30D', '90D', '1Y'] as const;

/** ACC1 passes one of four presets; no arbitrary date range is accepted. */
export class ProgressRangeDto {
  @IsOptional()
  @IsIn(DATE_RANGE_PRESETS as unknown as string[])
  range: DateRangePreset = '30D';
}
