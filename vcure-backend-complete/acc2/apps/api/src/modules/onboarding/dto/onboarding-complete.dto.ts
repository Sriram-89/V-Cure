import { Type } from 'class-transformer';
import {
  IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsString,
  Length, Max, Min, ValidateNested,
} from 'class-validator';

export class PersonalInfoDto {
  @IsDateString() dateOfBirth!: string;
  @IsString() gender!: string;
  @IsString() @Length(7, 20) phone!: string;
}

export class OnboardingHealthProfileDto {
  @IsNumber() @Min(50) @Max(260) heightCm!: number;
  @IsNumber() @Min(20) @Max(400) weightKg!: number;
  @IsOptional() @IsString() bloodGroup?: string;
}

export class OnboardingMedicalProfileDto {
  @IsArray() @IsString({ each: true }) conditions!: string[];
  @IsArray() @IsString({ each: true }) allergies!: string[];
  @IsArray() @IsString({ each: true }) medications!: string[];
}

export class OnboardingLifestyleDto {
  @IsOptional() @IsString() activityLevel?: string;
  @IsInt() @Min(0) @Max(24) sleepHours!: number;
  @IsOptional() @IsString() smokingStatus?: string;
  @IsOptional() @IsString() alcoholConsumption?: string;
  @IsOptional() @IsString() dietType?: string;
}

export class OnboardingGoalsDto {
  @IsOptional() @IsString() primaryGoal?: string;
  @IsOptional() @IsString() timeline?: string;
  @IsOptional() @IsNumber() @Min(20) @Max(300) targetWeightKg?: number;
}

export class OnboardingCompleteDto {
  @ValidateNested() @Type(() => PersonalInfoDto) personalInfo!: PersonalInfoDto;
  @ValidateNested() @Type(() => OnboardingHealthProfileDto) healthProfile!: OnboardingHealthProfileDto;
  @ValidateNested() @Type(() => OnboardingMedicalProfileDto) medicalProfile!: OnboardingMedicalProfileDto;
  @ValidateNested() @Type(() => OnboardingLifestyleDto) lifestyle!: OnboardingLifestyleDto;
  @ValidateNested() @Type(() => OnboardingGoalsDto) goals!: OnboardingGoalsDto;
}
