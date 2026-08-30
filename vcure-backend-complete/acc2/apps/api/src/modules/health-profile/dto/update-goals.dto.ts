import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateGoalsDto {
  @IsOptional()
  @IsString()
  primaryGoal?: string;

  @IsOptional()
  @IsString()
  timeline?: string;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  targetWeightKg?: number;
}
