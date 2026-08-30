import { apiClient } from "@/lib/api-client";
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
  getUserProfile: () => apiClient.get<UserProfileDto>("/user/profile"),
  updateUserProfile: (payload: UserProfileFormValues) =>
    apiClient.patch<UserProfileDto>("/user/profile", payload),

  getHealthProfile: () => apiClient.get<HealthProfileDto>("/health-profile"),
  updateHealthProfile: (payload: HealthProfileFormValues) =>
    apiClient.patch<HealthProfileDto>("/health-profile", payload),

  getLifestyle: () => apiClient.get<LifestyleProfileDto>("/lifestyle"),
  updateLifestyle: (payload: LifestyleFormValues) =>
    apiClient.patch<LifestyleProfileDto>("/lifestyle", payload),

  getGoals: () => apiClient.get<HealthGoalDto>("/goals"),
  updateGoals: (payload: GoalsFormValues) =>
    apiClient.patch<HealthGoalDto>("/goals", payload),

  getCompletion: () => apiClient.get<ProfileCompletionDto>("/profile/completion"),

  // Medical history — ownership-scoped CRUD with soft deletes.
  listConditions: () => apiClient.get<MedicalConditionDto[]>("/medical-history/conditions"),
  createCondition: (payload: Omit<MedicalConditionDto, "id">) =>
    apiClient.post<MedicalConditionDto>("/medical-history/conditions", payload),
  updateCondition: (id: string, payload: Omit<MedicalConditionDto, "id">) =>
    apiClient.patch<MedicalConditionDto>(`/medical-history/conditions/${id}`, payload),
  deleteCondition: (id: string) =>
    apiClient.delete<void>(`/medical-history/conditions/${id}`),

  listAllergies: () => apiClient.get<AllergyDto[]>("/medical-history/allergies"),
  createAllergy: (payload: Omit<AllergyDto, "id">) =>
    apiClient.post<AllergyDto>("/medical-history/allergies", payload),
  updateAllergy: (id: string, payload: Omit<AllergyDto, "id">) =>
    apiClient.patch<AllergyDto>(`/medical-history/allergies/${id}`, payload),
  deleteAllergy: (id: string) => apiClient.delete<void>(`/medical-history/allergies/${id}`),

  listMedicines: () => apiClient.get<MedicineDto[]>("/medical-history/medicines"),
  createMedicine: (payload: Omit<MedicineDto, "id">) =>
    apiClient.post<MedicineDto>("/medical-history/medicines", payload),
  updateMedicine: (id: string, payload: Omit<MedicineDto, "id">) =>
    apiClient.patch<MedicineDto>(`/medical-history/medicines/${id}`, payload),
  deleteMedicine: (id: string) => apiClient.delete<void>(`/medical-history/medicines/${id}`),

  listFamilyHistory: () =>
    apiClient.get<FamilyHistoryDto[]>("/medical-history/family-history"),
  createFamilyHistory: (payload: Omit<FamilyHistoryDto, "id">) =>
    apiClient.post<FamilyHistoryDto>("/medical-history/family-history", payload),
  updateFamilyHistory: (id: string, payload: Omit<FamilyHistoryDto, "id">) =>
    apiClient.patch<FamilyHistoryDto>(`/medical-history/family-history/${id}`, payload),
  deleteFamilyHistory: (id: string) =>
    apiClient.delete<void>(`/medical-history/family-history/${id}`),

  deleteAccount: () => apiClient.delete<void>("/user/profile")
};
