import type {
  DeviceSession,
  LanguageSettings,
  NotificationPreferences,
  PrivacyConsentSettings,
  UnitsPreference
} from "@/types/settings";

export interface SettingsAdapter {
  getLanguageSettings(): Promise<LanguageSettings>;
  updateLanguageSettings(settings: LanguageSettings): Promise<LanguageSettings>;
  getUnitsPreference(): Promise<UnitsPreference>;
  updateUnitsPreference(preference: UnitsPreference): Promise<UnitsPreference>;
  getNotificationPreferences(): Promise<NotificationPreferences>;
  updateNotificationPreferences(
    preferences: NotificationPreferences
  ): Promise<NotificationPreferences>;
  getPrivacyConsent(): Promise<PrivacyConsentSettings>;
  updatePrivacyConsent(settings: PrivacyConsentSettings): Promise<PrivacyConsentSettings>;
  getDeviceSessions(): Promise<DeviceSession[]>;
  logoutSession(sessionId: string): Promise<void>;
  logoutAllOtherSessions(): Promise<void>;
}
