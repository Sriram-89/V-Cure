import type { AuthUserDto } from "@/types/auth";
import type { OnboardingDraft } from "@/store/onboarding-store";

const GENERIC_NAMES = new Set([
  "demo",
  "demo user",
  "demo patient",
  "v-cure patient",
  "v-cure",
  "patient",
  "user"
]);

export function isGenericName(name?: string | null): boolean {
  if (!name || !name.trim()) return true;
  return GENERIC_NAMES.has(name.trim().toLowerCase());
}

/**
 * Resolves the canonical user full name using the strict identity hierarchy:
 * Priority 1: Authenticated Auth Store User Name (if non-generic)
 * Priority 2: Fresh Backend Profile Data (if non-generic)
 * Priority 3: User-Scoped Onboarding Draft Name (if non-generic)
 * Fallback: "V-Cure Patient"
 */
export function getAuthoritativeFullName(
  authUser?: AuthUserDto | null,
  dashboardFullName?: string | null,
  draft?: OnboardingDraft | null
): string {
  // Priority 1: Authenticated User Store
  if (authUser?.fullName && !isGenericName(authUser.fullName)) {
    return authUser.fullName.trim();
  }

  // Priority 2: Fresh Backend Data (e.g. from /dashboard or /user/profile)
  if (dashboardFullName && !isGenericName(dashboardFullName)) {
    return dashboardFullName.trim();
  }

  // Priority 3: User-scoped onboarding draft
  if (draft?.personalInfo?.fullName && !isGenericName(draft.personalInfo.fullName)) {
    return draft.personalInfo.fullName.trim();
  }

  return "V-Cure Patient";
}
