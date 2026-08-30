import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMedicalConditionDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsDateString()
  diagnosedAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
