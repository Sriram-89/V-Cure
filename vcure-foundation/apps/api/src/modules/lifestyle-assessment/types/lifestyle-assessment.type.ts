import {
  AlcoholStatus,
  SleepQuality,
  SmokingStatus,
  StressLevel,
} from '@prisma/client';

export interface LifestyleAssessmentResponse {
  id: string;
  userId: string;
  workingHoursPerDay: number | null;
  sleepHoursAvg: number | null;
  sleepQuality: SleepQuality | null;
  stressLevel: StressLevel | null;
  waterIntakeLitersAvg: number | null;
  smokingStatus: SmokingStatus;
  alcoholStatus: AlcoholStatus;
  exerciseFrequencyPerWeek: number | null;
  mealTimingNotes: string | null;
  riskFlags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LifestyleAssessmentTrendPoint {
  id: string;
  workingHoursPerDay: number | null;
  sleepHoursAvg: number | null;
  sleepQuality: SleepQuality | null;
  stressLevel: StressLevel | null;
  waterIntakeLitersAvg: number | null;
  smokingStatus: SmokingStatus;
  alcoholStatus: AlcoholStatus;
  exerciseFrequencyPerWeek: number | null;
  recordedAt: Date;
}
