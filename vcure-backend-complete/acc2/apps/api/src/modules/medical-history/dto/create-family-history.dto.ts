import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFamilyHistoryDto {
  @IsString()
  relation!: string;

  @IsString()
  @MaxLength(150)
  condition!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
