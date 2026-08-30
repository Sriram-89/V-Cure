import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFamilyHistoryDto {
  @IsString()
  @MaxLength(50)
  relation!: string;

  @IsString()
  @MaxLength(150)
  condition!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
