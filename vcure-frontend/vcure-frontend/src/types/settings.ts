// Settings module types.
// Sections implemented here are limited to what's documented in the
// Engineering Bible's Settings Screen spec (AI_Design.docx §59: Profile,
// Notifications, Language, Theme, Privacy, Security, Subscription, Support,
// About) and the Account Settings flow (Data_Layer.docx Use Case 31:
// Language → Notifications → Privacy → Dark Mode → Units → Security → Save).
// "Profile" and "Subscription" are not re-implemented here — they link out
// to the existing Profile and Premium modules to avoid duplicating those
// domain models.

// Primary languages per AI_Design.docx §16 (AI Language Support). Future
// languages are listed but not selectable yet.
export type LanguageCode = "en" | "hi" | "te";
export type FutureLanguageCode = "ta" | "kn" | "ml" | "mr";

export type ThemePreference = "light" | "dark" | "system";
export type HeightUnit = "cm" | "ft_in";
export type WeightUnit = "kg" | "lb";

export interface UnitsPreference {
  heightUnit: HeightUnit;
  weightUnit: WeightUnit;
}

// Notification types per Data_Layer.docx Use Case 27.
export interface NotificationPreferences {
  mealReminder: boolean;
  waterReminder: boolean;
  exerciseReminder: boolean;
  medicineReminder: boolean;
  sleepReminder: boolean;
  healthTips: boolean;
}

// "Consent" appears as a documented compliance-audit category in
// AI_Design.docx §56. Modeled here as a single research/analytics consent
// toggle rather than inventing additional undocumented privacy controls.
export interface PrivacyConsentSettings {
  shareDataForResearch: boolean;
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  location: string;
  lastActiveAt: string;
  isCurrentDevice: boolean;
}

export interface LanguageSettings {
  languageCode: LanguageCode;
}
