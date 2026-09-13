import type { SettingsAdapter } from "@/lib/settings-adapter/types";
import { mockSettingsAdapter } from "@/lib/settings-adapter/mock-adapter";

// TODO(backend): once /settings/* endpoints exist per the User Domain
// (UserSettings, LanguagePreference, NotificationPreference tables in
// 03_DATABASE_ARCHITECTURE.md Part 3B §34), implement a RealSettingsAdapter
// against apiClient and swap it in here. No component or hook in
// src/components/settings or src/hooks/use-settings.ts should need to change.
export const settingsAdapter: SettingsAdapter = mockSettingsAdapter;

export type { SettingsAdapter } from "@/lib/settings-adapter/types";
