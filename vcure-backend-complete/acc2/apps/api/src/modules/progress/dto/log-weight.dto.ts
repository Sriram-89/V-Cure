import { IsNumber, Max, Min } from 'class-validator';

/** ACC1 `logWeightEntry(weightKg)`. Bounds match the health-profile DTO. */
export class LogWeightDto {
  @IsNumber()
  @Min(20)
  @Max(400)
  weightKg!: number;
}
