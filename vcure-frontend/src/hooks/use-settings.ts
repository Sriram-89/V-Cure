import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/settings-service";
import type {
  LanguageSettings,
  NotificationPreferences,
  PrivacyConsentSettings,
  UnitsPreference
} from "@/types/settings";

export function useLanguageSettings() {
  return useQuery({ queryKey: ["settings", "language"], queryFn: settingsService.getLanguage });
}

export function useUpdateLanguageSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: LanguageSettings) => settingsService.updateLanguage(settings),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "language"] })
  });
}

export function useUnitsPreference() {
  return useQuery({ queryKey: ["settings", "units"], queryFn: settingsService.getUnits });
}

export function useUpdateUnitsPreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preference: UnitsPreference) => settingsService.updateUnits(preference),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "units"] })
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["settings", "notifications"],
    queryFn: settingsService.getNotificationPreferences
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preferences: NotificationPreferences) =>
      settingsService.updateNotificationPreferences(preferences),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "notifications"] })
  });
}

export function usePrivacyConsent() {
  return useQuery({ queryKey: ["settings", "privacy"], queryFn: settingsService.getPrivacyConsent });
}

export function useUpdatePrivacyConsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: PrivacyConsentSettings) => settingsService.updatePrivacyConsent(settings),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "privacy"] })
  });
}

export function useDeviceSessions() {
  return useQuery({ queryKey: ["settings", "sessions"], queryFn: settingsService.getDeviceSessions });
}

export function useLogoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => settingsService.logoutSession(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "sessions"] })
  });
}

export function useLogoutAllOtherSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => settingsService.logoutAllOtherSessions(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "sessions"] })
  });
}
