import { IsBoolean, IsIn, IsString } from 'class-validator';

export const SELECTABLE_LANGUAGE_CODES = ['en', 'hi', 'te'] as const;

export class UpdateLanguageSettingsDto {
  @IsString()
  @IsIn(SELECTABLE_LANGUAGE_CODES as unknown as string[])
  languageCode!: string;
}

export class UpdateUnitsPreferenceDto {
  @IsString()
  heightUnit!: string;

  @IsString()
  weightUnit!: string;
}

export class UpdateNotificationPreferencesDto {
  @IsBoolean() mealReminder!: boolean;
  @IsBoolean() waterReminder!: boolean;
  @IsBoolean() exerciseReminder!: boolean;
  @IsBoolean() medicineReminder!: boolean;
  @IsBoolean() sleepReminder!: boolean;
  @IsBoolean() healthTips!: boolean;
}

export class UpdatePrivacyConsentDto {
  @IsBoolean()
  shareDataForResearch!: boolean;
}
