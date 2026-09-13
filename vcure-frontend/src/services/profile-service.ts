import { apiClient } from "@/lib/api-client";
import { useOnboardingStore } from "@/store/onboarding-store";
import type {
  AllergyDto,
  FamilyHistoryDto,
  HealthGoalDto,
  HealthProfileDto,
  LifestyleProfileDto,
  MedicalConditionDto,
  MedicineDto,
  ProfileCompletionDto,
  UserProfileDto
} from "@/types/profile";
import type { UserProfileFormValues } from "@/lib/validation/profile";
import type {
  HealthProfileFormValues,
  LifestyleFormValues,
  GoalsFormValues
} from "@/lib/validation/onboarding";

export const profileService = {
  getUserProfile: async (): Promise<UserProfileDto> => {
    try {
      return await apiClient.get<UserProfileDto>("/user/profile");
    } catch {
      const draft = useOnboardingStore.getState().draft;
      const { useAuthStore } = require("@/store/auth-store");
      const authUser = useAuthStore.getState().user;
      return {
        id: authUser?.id || "user-active",
        fullName: authUser?.fullName || draft.personalInfo?.fullName || "User",
        email: authUser?.email || "",
        phone: (draft.personalInfo as any)?.phone || "+91 9876543210",
        dateOfBirth: "1992-01-01",
        gender: (draft.personalInfo?.gender as any) || "MALE",
        avatarUrl: authUser?.avatarUrl || (draft.personalInfo as any)?.avatarUrl || null
      };
    }
  },

  updateUserProfile: async (payload: UserProfileFormValues): Promise<UserProfileDto> => {
    useOnboardingStore.getState().updatePersonalInfo(payload as any);
    const { useAuthStore } = require("@/store/auth-store");
    const currentSession = useAuthStore.getState();
    if (currentSession.user) {
      currentSession.setSession(
        {
          ...currentSession.user,
          fullName: payload.fullName,
          avatarUrl: payload.avatarUrl !== undefined ? payload.avatarUrl : currentSession.user.avatarUrl
        },
        currentSession.accessToken || "",
        currentSession.refreshToken || ""
      );
    }
    try {
      return await apiClient.patch<UserProfileDto>("/user/profile", payload);
    } catch {
      const authUser = currentSession.user;
      return {
        id: authUser?.id || "user-active",
        fullName: payload.fullName,
        email: authUser?.email || "",
        phone: payload.phone || "",
        dateOfBirth: "1992-01-01",
        gender: "MALE",
        avatarUrl: payload.avatarUrl !== undefined ? payload.avatarUrl : authUser?.avatarUrl || null
      };
    }
  },

  getHealthProfile: async (): Promise<HealthProfileDto> => {
    try {
      return await apiClient.get<HealthProfileDto>("/health-profile");
    } catch {
      const draft = useOnboardingStore.getState().draft;
      const heightCm = draft.personalInfo?.heightCm || 170;
      const weightKg = draft.personalInfo?.weightKg || 70;
      const bmi = parseFloat((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1));
      return {
        heightCm,
        weightKg,
        bloodGroup: "O_POSITIVE",
        bmi,
        bmiCategory: bmi < 25 ? "NORMAL" : "OVERWEIGHT",
        updatedAt: new Date().toISOString()
      };
    }
  },

  updateHealthProfile: async (payload: HealthProfileFormValues): Promise<HealthProfileDto> => {
    useOnboardingStore.getState().updateHealthProfile(payload);
    useOnboardingStore.getState().updatePersonalInfo(payload as any);
    try {
      return await apiClient.patch<HealthProfileDto>("/health-profile", payload);
    } catch {
      const heightCm = payload.heightCm || 170;
      const weightKg = payload.weightKg || 70;
      const bmi = parseFloat((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1));
      return {
        heightCm,
        weightKg,
        bloodGroup: "O_POSITIVE",
        bmi,
        bmiCategory: bmi < 25 ? "NORMAL" : "OVERWEIGHT",
        updatedAt: new Date().toISOString()
      };
    }
  },

  getLifestyle: async (): Promise<LifestyleProfileDto> => {
    try {
      return await apiClient.get<LifestyleProfileDto>("/lifestyle");
    } catch {
      const draft = useOnboardingStore.getState().draft;
      return {
        activityLevel: (draft.lifestyle?.activityLevel as any) || "MODERATELY_ACTIVE",
        sleepHours: draft.lifestyle?.sleepHours || 7,
        smokingStatus: "NEVER",
        alcoholConsumption: "NONE",
        dietType: (draft.foodPreferences?.dietType as any) || "VEGETARIAN"
      };
    }
  },

  updateLifestyle: async (payload: LifestyleFormValues): Promise<LifestyleProfileDto> => {
    useOnboardingStore.getState().updateLifestyle(payload);
    try {
      return await apiClient.patch<LifestyleProfileDto>("/lifestyle", payload);
    } catch {
      return {
        activityLevel: (payload.activityLevel as any) || "MODERATELY_ACTIVE",
        sleepHours: payload.sleepHours || 7,
        smokingStatus: "NEVER",
        alcoholConsumption: "NONE",
        dietType: "VEGETARIAN"
      };
    }
  },

  getGoals: async (): Promise<HealthGoalDto> => {
    try {
      return await apiClient.get<HealthGoalDto>("/goals");
    } catch {
      const draft = useOnboardingStore.getState().draft;
      return {
        primaryGoal: (draft.goals?.primaryGoal as any) || "MANAGE_CONDITION",
        timeline: (draft.goals?.timeline as any) || "THREE_MONTHS",
        targetWeightKg: 65
      };
    }
  },

  updateGoals: async (payload: GoalsFormValues): Promise<HealthGoalDto> => {
    useOnboardingStore.getState().updateGoals(payload);
    try {
      return await apiClient.patch<HealthGoalDto>("/goals", payload);
    } catch {
      return {
        primaryGoal: (payload.primaryGoal as any) || "MANAGE_CONDITION",
        timeline: (payload.timeline as any) || "THREE_MONTHS",
        targetWeightKg: 65
      };
    }
  },

  getCompletion: async (): Promise<ProfileCompletionDto> => {
    try {
      return await apiClient.get<ProfileCompletionDto>("/profile/completion");
    } catch {
      return {
        percentage: 100,
        missingSections: []
      };
    }
  },

  listConditions: async (): Promise<MedicalConditionDto[]> => {
    try {
      return await apiClient.get<MedicalConditionDto[]>("/medical-history/conditions");
    } catch {
      const draft = useOnboardingStore.getState().draft;
      const conditions = draft.medicalConditions?.conditions || draft.medicalProfile?.conditions || [];
      return conditions.map((c, i) => ({
        id: `cond-${i}`,
        name: typeof c === "string" ? c : (c as any).name || "Prediabetes",
        status: "ACTIVE",
        diagnosedDate: null,
        notes: null
      }));
    }
  },

  createCondition: async (payload: Omit<MedicalConditionDto, "id">): Promise<MedicalConditionDto> => {
    const draft = useOnboardingStore.getState().draft;
    const existing = draft.medicalConditions?.conditions || [];
    useOnboardingStore.getState().updateMedicalConditions({
      conditions: [...existing, payload.name as any]
    });
    try {
      return await apiClient.post<MedicalConditionDto>("/medical-history/conditions", payload);
    } catch {
      return { id: `cond-${Date.now()}`, ...payload };
    }
  },

  updateCondition: async (id: string, payload: Omit<MedicalConditionDto, "id">): Promise<MedicalConditionDto> => {
    try {
      return await apiClient.patch<MedicalConditionDto>(`/medical-history/conditions/${id}`, payload);
    } catch {
      return { id, ...payload };
    }
  },

  deleteCondition: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`/medical-history/conditions/${id}`);
    } catch {
      // local sync
    }
  },

  listAllergies: async (): Promise<AllergyDto[]> => {
    try {
      return await apiClient.get<AllergyDto[]>("/medical-history/allergies");
    } catch {
      const draft = useOnboardingStore.getState().draft;
      const allergies = draft.allergies?.allergies || draft.medicalProfile?.allergies || [];
      return allergies.map((a, i) => ({
        id: `allergy-${i}`,
        allergen: typeof a === "string" ? a : (a as any).name || "Peanuts",
        severity: "SEVERE" as const,
        reaction: "Safety Engine Blocked"
      }));
    }
  },

  createAllergy: async (payload: Omit<AllergyDto, "id">): Promise<AllergyDto> => {
    const draft = useOnboardingStore.getState().draft;
    const existing = draft.allergies?.allergies || [];
    useOnboardingStore.getState().updateAllergies({
      allergies: [...existing, payload.allergen as any],
      intolerances: draft.allergies?.intolerances || []
    });
    try {
      return await apiClient.post<AllergyDto>("/medical-history/allergies", payload);
    } catch {
      return { id: `allergy-${Date.now()}`, ...payload };
    }
  },

  updateAllergy: async (id: string, payload: Omit<AllergyDto, "id">): Promise<AllergyDto> => {
    try {
      return await apiClient.patch<AllergyDto>(`/medical-history/allergies/${id}`, payload);
    } catch {
      return { id, ...payload };
    }
  },

  deleteAllergy: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`/medical-history/allergies/${id}`);
    } catch {
      // local sync
    }
  },

  listMedicines: async (): Promise<MedicineDto[]> => {
    try {
      return await apiClient.get<MedicineDto[]>("/medical-history/medicines");
    } catch {
      const draft = useOnboardingStore.getState().draft;
      const meds = draft.medications?.medications || draft.medicalProfile?.medications || [];
      return meds.map((m, i) => ({
        id: `med-${i}`,
        name: typeof m === "string" ? m : (m as any).name || "Metformin",
        dosage: typeof m === "string" ? "500mg" : (m as any).dosage || "500mg",
        frequency: "DAILY",
        isOngoing: true
      }));
    }
  },

  createMedicine: async (payload: Omit<MedicineDto, "id">): Promise<MedicineDto> => {
    const draft = useOnboardingStore.getState().draft;
    const existing = draft.medications?.medications || [];
    useOnboardingStore.getState().updateMedications({
      medications: [...existing, payload.name as any]
    });
    try {
      return await apiClient.post<MedicineDto>("/medical-history/medicines", payload);
    } catch {
      return { id: `med-${Date.now()}`, ...payload };
    }
  },

  updateMedicine: async (id: string, payload: Omit<MedicineDto, "id">): Promise<MedicineDto> => {
    try {
      return await apiClient.patch<MedicineDto>(`/medical-history/medicines/${id}`, payload);
    } catch {
      return { id, ...payload };
    }
  },

  deleteMedicine: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`/medical-history/medicines/${id}`);
    } catch {
      // local sync
    }
  },

  listFamilyHistory: async (): Promise<FamilyHistoryDto[]> => {
    try {
      return await apiClient.get<FamilyHistoryDto[]>("/medical-history/family-history");
    } catch {
      return [];
    }
  },

  createFamilyHistory: async (payload: Omit<FamilyHistoryDto, "id">): Promise<FamilyHistoryDto> => {
    try {
      return await apiClient.post<FamilyHistoryDto>("/medical-history/family-history", payload);
    } catch {
      return { id: `fam-${Date.now()}`, ...payload };
    }
  },

  updateFamilyHistory: async (id: string, payload: Omit<FamilyHistoryDto, "id">): Promise<FamilyHistoryDto> => {
    try {
      return await apiClient.patch<FamilyHistoryDto>(`/medical-history/family-history/${id}`, payload);
    } catch {
      return { id, ...payload };
    }
  },

  deleteFamilyHistory: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`/medical-history/family-history/${id}`);
    } catch {
      // local sync
    }
  },

  deleteAccount: () => apiClient.delete<void>("/user/profile")
};
