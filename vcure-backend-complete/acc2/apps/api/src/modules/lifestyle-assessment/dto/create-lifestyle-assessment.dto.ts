import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLifestyleAssessmentDto {
  @IsOptional()
  @IsString()
  dietType?: string;

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
  @IsString()
  sleepQuality?: string;

  @IsOptional()
  @IsString()
  stressLevel?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(15)
  waterIntakeLitersAvg?: number;

  @IsOptional()
  @IsString()
  smokingStatus?: string;

  @IsOptional()
  @IsString()
  alcoholConsumption?: string;

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
