/** One logged water intake (Bible API 45 GET /water/history). */
export interface WaterEntryResponse {
  id: string;
  amountMl: number;
  loggedAt: Date;
}

/**
 * Daily total. ACC1's `logWaterIntake` returns `{ waterLoggedMl }`.
 * No target is included — no water-target formula is defined (AI-D1 / M-05).
 */
export interface WaterDailyTotalResponse {
  date: string;
  waterLoggedMl: number;
}

/** Bible API 46 response. */
export interface SleepEntryResponse {
  id: string;
  hours: number;
  quality: string;
  bedTime: Date | null;
  wakeTime: Date | null;
  loggedAt: Date;
}

/** Bible API 47 response. */
export interface ExerciseEntryResponse {
  id: string;
  exerciseType: string;
  durationMinutes: number;
  caloriesBurned: number | null;
  loggedAt: Date;
}
