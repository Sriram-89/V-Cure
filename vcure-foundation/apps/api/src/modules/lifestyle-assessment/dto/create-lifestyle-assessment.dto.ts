import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  AlcoholStatus,
  SleepQuality,
  SmokingStatus,
  StressLevel,
} from '@prisma/client';

export class CreateLifestyleAssessmentDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  workingHoursPerDay?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  sleepHoursAvg?: number;

  @IsOptional()
  @IsEnum(SleepQuality)
  sleepQuality?: SleepQuality;

  @IsOptional()
  @IsEnum(StressLevel)
  stressLevel?: StressLevel;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(15)
  waterIntakeLitersAvg?: number;

  @IsOptional()
  @IsEnum(SmokingStatus)
  smokingStatus?: SmokingStatus;

  @IsOptional()
  @IsEnum(AlcoholStatus)
  alcoholStatus?: AlcoholStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(21)
  exerciseFrequencyPerWeek?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  mealTimingNotes?: string;
}
