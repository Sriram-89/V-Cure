import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { DiseaseSeverity } from '@prisma/client';

export class CreateAllergyDto {
  // Free text by design — the product spec requires custom allergy input,
  // not a closed enum of allergens.
  @IsString()
  @MaxLength(150)
  allergen!: string;

  @IsOptional()
  @IsEnum(DiseaseSeverity)
  severity?: DiseaseSeverity;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reaction?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
