import {
  DEMO_PERSONAS,
  findDemoPersonaByEmail,
  findDemoPersonaById,
  type DemoPersona
} from "@/constants/demo-showcase-data";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useAuthStore } from "@/store/auth-store";

const DEMO_CACHE_PREFIX = "vcure-demo-cache:";
const DEMO_USER_MAPPINGS_KEY = "vcure-demo-user-mappings";

function getCacheKey(userId: string): string {
  return `${DEMO_CACHE_PREFIX}${userId}`;
}

function getDemoUserMappings(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DEMO_USER_MAPPINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDemoUserMapping(userId: string, personaId: string): void {
  if (typeof window === "undefined") return;
  try {
    const mappings = getDemoUserMappings();
    mappings[userId] = personaId;
    window.localStorage.setItem(DEMO_USER_MAPPINGS_KEY, JSON.stringify(mappings));
  } catch {
    // ignore quota errors
  }
}

export const demoShowcaseService = {
  isDemoUser(userIdOrEmail?: string | null): boolean {
    if (!userIdOrEmail) return false;
    return !!this.getPersona(userIdOrEmail);
  },

  getPersona(userIdOrEmail?: string | null): DemoPersona | undefined {
    if (!userIdOrEmail) return undefined;
    const clean = userIdOrEmail.trim().toLowerCase();

    // 1. Check exact email match
    const byEmail = findDemoPersonaByEmail(clean);
    if (byEmail) return byEmail;

    // 2. Check exact persona ID match
    const byId = findDemoPersonaById(userIdOrEmail);
    if (byId) return byId;

    // 3. Check exact user ID mapping saved during authentic login
    const mappings = getDemoUserMappings();
    const mappedPersonaId = mappings[userIdOrEmail];
    if (mappedPersonaId) {
      return findDemoPersonaById(mappedPersonaId);
    }

    return undefined;
  },

  /**
   * Initializes user-scoped demo showcase state for an authentically logged-in persona.
   * Uses real backend authenticated userId for state partitioning and offline caching.
   */
  initializeDemoPersona(persona: DemoPersona, authenticatedUserId?: string): void {
    if (typeof window === "undefined") return;

    const activeUserId = authenticatedUserId || persona.id;
    saveDemoUserMapping(activeUserId, persona.id);

    // Synchronize authenticated user identity in authStore
    const authStore = useAuthStore.getState();
    if (authStore.user) {
      authStore.updateUser({ fullName: persona.fullName });
    }

    // Initialize User-Scoped Onboarding Draft under activeUserId
    const onboardingStore = useOnboardingStore.getState();
    onboardingStore.initForUser(activeUserId, persona.fullName);

    // Populate draft fields for existing recommendation engine compatibility
    onboardingStore.updatePersonalInfo({
      fullName: persona.fullName,
      phone: "+91 9876543210",
      dateOfBirth: persona.dateOfBirth,
      gender: persona.gender,
      heightCm: persona.heightCm,
      weightKg: persona.weightKg,
      avatarUrl: null
    } as any);

    onboardingStore.updateDiabetesCategory({
      category: persona.diabetesCategory as any,
      duration: "NOT_SURE",
      isGestational: false
    });

    onboardingStore.updateMedicalConditions({
      conditions: persona.healthConditions as any
    });

    onboardingStore.updateAllergies({
      allergies: persona.allergies as any,
      intolerances: []
    });

    onboardingStore.updateMedications({
      medications: persona.medications.map((m) => m.name) as any
    });

    onboardingStore.updateGoals({
      primaryGoal: persona.primaryGoal as any,
      timeline: "THREE_MONTHS"
    });

    onboardingStore.updateFoodPreferences({
      dietType: persona.dietaryContext.dietType as any,
      regionalCuisine: "ANDHRA",
      eggPreference: false,
      avoidIngredients: []
    });

    onboardingStore.completeOnboarding();

    // User-Scoped Local Offline Cache
    try {
      const cacheKey = getCacheKey(activeUserId);
      window.localStorage.setItem(
        cacheKey,
        JSON.stringify({
          personaId: persona.id,
          reports: persona.healthReports,
          insurance: persona.insurancePolicies,
          logs: persona.healthLogs,
          cachedAt: new Date().toISOString()
        })
      );
    } catch {
      // ignore storage quota errors
    }
  },

  /**
   * Retrieves cached reports for the active demo user (works 100% offline).
   */
  getDemoReports(userId: string) {
    const persona = this.getPersona(userId);
    if (!persona) return [];
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(getCacheKey(userId));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.reports) return parsed.reports;
        }
      } catch {
        // fallback
      }
    }
    return persona.healthReports;
  },

  /**
   * Retrieves cached insurance policies for the active demo user (works 100% offline).
   */
  getDemoInsurance(userId: string) {
    const persona = this.getPersona(userId);
    if (!persona) return [];
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(getCacheKey(userId));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.insurance) return parsed.insurance;
        }
      } catch {
        // fallback
      }
    }
    return persona.insurancePolicies;
  },

  /**
   * Retrieves cached health logs for the active demo user (works 100% offline).
   */
  getDemoHealthLogs(userId: string) {
    const persona = this.getPersona(userId);
    if (!persona) return [];
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(getCacheKey(userId));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.logs) return parsed.logs;
        }
      } catch {
        // fallback
      }
    }
    return persona.healthLogs;
  }
};
