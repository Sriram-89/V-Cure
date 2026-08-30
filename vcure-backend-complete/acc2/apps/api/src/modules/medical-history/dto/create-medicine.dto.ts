import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMedicineDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  dosage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  frequency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  prescribedFor?: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  /** API field name per ACC1 medicineSchema; persisted as Medicine.isActive. */
  @IsOptional()
  @IsBoolean()
  isOngoing?: boolean;
}
