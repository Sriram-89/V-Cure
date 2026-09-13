import { settingsAdapter } from "@/lib/settings-adapter";
import type {
  LanguageSettings,
  NotificationPreferences,
  PrivacyConsentSettings,
  UnitsPreference
} from "@/types/settings";

export const settingsService = {
  getLanguage: () => settingsAdapter.getLanguageSettings(),
  updateLanguage: (settings: LanguageSettings) => settingsAdapter.updateLanguageSettings(settings),
  getUnits: () => settingsAdapter.getUnitsPreference(),
  updateUnits: (preference: UnitsPreference) => settingsAdapter.updateUnitsPreference(preference),
  getNotificationPreferences: () => settingsAdapter.getNotificationPreferences(),
  updateNotificationPreferences: (preferences: NotificationPreferences) =>
    settingsAdapter.updateNotificationPreferences(preferences),
  getPrivacyConsent: () => settingsAdapter.getPrivacyConsent(),
  updatePrivacyConsent: (settings: PrivacyConsentSettings) =>
    settingsAdapter.updatePrivacyConsent(settings),
  getDeviceSessions: () => settingsAdapter.getDeviceSessions(),
  logoutSession: (sessionId: string) => settingsAdapter.logoutSession(sessionId),
  logoutAllOtherSessions: () => settingsAdapter.logoutAllOtherSessions()
};
