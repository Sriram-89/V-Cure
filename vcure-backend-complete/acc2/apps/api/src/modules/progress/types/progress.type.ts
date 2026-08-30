import { BmiCategory } from '../../health-profile/types/health-profile.type';

/** ACC1 `DateRangePreset`. */
export type DateRangePreset = '7D' | '30D' | '90D' | '1Y';

/** ACC1 `WeightEntry`. */
export interface WeightEntry {
  date: string;
  weightKg: number;
}

/** ACC1 `BmiEntry`. */
export interface BmiEntry {
  date: string;
  bmi: number;
  category: BmiCategory;
}
