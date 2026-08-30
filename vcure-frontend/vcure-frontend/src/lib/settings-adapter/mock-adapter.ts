import type { SettingsAdapter } from "@/lib/settings-adapter/types";
import type {
  DeviceSession,
  LanguageSettings,
  NotificationPreferences,
  PrivacyConsentSettings,
  UnitsPreference
} from "@/types/settings";

const SIMULATED_LATENCY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));
}

let languageSettings: LanguageSettings = { languageCode: "en" };
let unitsPreference: UnitsPreference = { heightUnit: "cm", weightUnit: "kg" };
let notificationPreferences: NotificationPreferences = {
  mealReminder: true,
  waterReminder: true,
  exerciseReminder: false,
  medicineReminder: true,
  sleepReminder: false,
  healthTips: true
};
let privacyConsent: PrivacyConsentSettings = { shareDataForResearch: false };

let deviceSessions: DeviceSession[] = [
  {
    id: "session-current",
    deviceName: "This device — Chrome on Windows",
    location: "Visakhapatnam, IN",
    lastActiveAt: new Date().toISOString(),
    isCurrentDevice: true
  },
  {
    id: "session-2",
    deviceName: "V-Cure app — iPhone 14",
    location: "Visakhapatnam, IN",
    lastActiveAt: "2026-08-06T18:22:00Z",
    isCurrentDevice: false
  }
];

export const mockSettingsAdapter: SettingsAdapter = {
  async getLanguageSettings() {
    return delay({ ...languageSettings });
  },
  async updateLanguageSettings(settings) {
    languageSettings = settings;
    return delay({ ...languageSettings });
  },

  async getUnitsPreference() {
    return delay({ ...unitsPreference });
  },
  async updateUnitsPreference(preference) {
    unitsPreference = preference;
    return delay({ ...unitsPreference });
  },

  async getNotificationPreferences() {
    return delay({ ...notificationPreferences });
  },
  async updateNotificationPreferences(preferences) {
    notificationPreferences = preferences;
    return delay({ ...notificationPreferences });
  },

  async getPrivacyConsent() {
    return delay({ ...privacyConsent });
  },
  async updatePrivacyConsent(settings) {
    privacyConsent = settings;
    return delay({ ...privacyConsent });
  },

  async getDeviceSessions() {
    return delay([...deviceSessions]);
  },
  async logoutSession(sessionId) {
    deviceSessions = deviceSessions.filter((s) => s.id !== sessionId);
    return delay(undefined);
  },
  async logoutAllOtherSessions() {
    deviceSessions = deviceSessions.filter((s) => s.isCurrentDevice);
    return delay(undefined);
  }
};
