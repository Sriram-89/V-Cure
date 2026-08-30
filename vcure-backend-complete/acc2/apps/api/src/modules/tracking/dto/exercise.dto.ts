import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

/**
 * Bible API 47 — POST /exercise. Fields: Exercise Type, Duration,
 * Calories Burned.
 *
 * `exerciseType` is free text — API 47 enumerates no values, so no closed set
 * is imposed. `caloriesBurned` is accepted from the client and never derived.
 */
export class LogExerciseDto {
  @IsString()
  @MaxLength(80)
  exerciseType!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1440)
  durationMinutes!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(20000)
  caloriesBurned?: number;
}
