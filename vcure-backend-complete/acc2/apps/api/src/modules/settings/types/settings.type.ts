export type HeightUnit = 'CM' | 'INCHES';
export type WeightUnit = 'KG' | 'LBS';

/** ACC1 `LanguageSettings`. Backed by UserProfile.language. */
export interface LanguageSettingsResponse {
  languageCode: string;
}

/** ACC1 `UnitsPreference`. */
export interface UnitsPreferenceResponse {
  heightUnit: HeightUnit;
  weightUnit: WeightUnit;
}

/** ACC1 `NotificationPreferences`. */
export interface NotificationPreferencesResponse {
  mealReminder: boolean;
  waterReminder: boolean;
  exerciseReminder: boolean;
  medicineReminder: boolean;
  sleepReminder: boolean;
  healthTips: boolean;
}

/** ACC1 `PrivacyConsentSettings`. */
export interface PrivacyConsentResponse {
  shareDataForResearch: boolean;
}
