import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ConditionStatus } from '@prisma/client';

export class CreateMedicalConditionDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  /** API field name per ACC1 conditionSchema; persisted as diagnosedAt. */
  @IsOptional()
  @IsDateString()
  diagnosedDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
