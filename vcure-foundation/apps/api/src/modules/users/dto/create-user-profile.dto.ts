import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateUserProfileDto {
  @IsString()
  @Length(2, 120)
  fullName!: string;

  @IsDateString()
  dateOfBirth!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsOptional()
  @IsString()
  @Length(7, 20)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  country?: string;

  @IsOptional()
  @IsString()
  @Length(2, 5)
  language?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
