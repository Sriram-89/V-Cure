

export interface LifestyleAssessmentResponse {
  id: string;
  userId: string;
  sleepHoursAvg: number | null;
  stressLevel: string | null;
  dietType: string | null;
  waterIntakeLitersAvg: number | null;
  smokingStatus: string | null;
  alcoholConsumption: string | null;
  exerciseFrequencyPerWeek: number | null;
  riskFlags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Canonical DailyLifestyle carries only sleep and stress per day, so the trend
 * payload reflects exactly that. No compatibility columns were added for the
 * wider ACC2 snapshot — it has no ACC1 consumer.
 */
export interface LifestyleAssessmentTrendPoint {
  id: string;
  sleepHoursAvg: number | null;
  stressLevel: string | null;
  recordedAt: Date;
}
