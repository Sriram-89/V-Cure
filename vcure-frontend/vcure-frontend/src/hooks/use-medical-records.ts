import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile-service";
import type {
  AllergyDto,
  FamilyHistoryDto,
  MedicalConditionDto,
  MedicineDto
} from "@/types/profile";

interface ResourceApi<TItem, TInput> {
  list: () => Promise<TItem[]>;
  create: (payload: TInput) => Promise<TItem>;
  update: (id: string, payload: TInput) => Promise<TItem>;
  remove: (id: string) => Promise<void>;
}

function createResourceHooks<TItem extends { id: string }, TInput>(
  resourceKey: string,
  api: ResourceApi<TItem, TInput>
) {
  const queryKey = ["profile", resourceKey];

  function useList() {
    return useQuery({ queryKey, queryFn: api.list });
  }

  function useCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: TInput) => api.create(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: ["profile", "completion"] });
      }
    });
  }

  function useUpdate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: TInput }) =>
        api.update(id, payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey })
    });
  }

  function useRemove() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => api.remove(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: ["profile", "completion"] });
      }
    });
  }

  return { useList, useCreate, useUpdate, useRemove };
}

export const conditionHooks = createResourceHooks<
  MedicalConditionDto,
  Omit<MedicalConditionDto, "id">
>("conditions", {
  list: profileService.listConditions,
  create: profileService.createCondition,
  update: profileService.updateCondition,
  remove: profileService.deleteCondition
});

export const allergyHooks = createResourceHooks<AllergyDto, Omit<AllergyDto, "id">>(
  "allergies",
  {
    list: profileService.listAllergies,
    create: profileService.createAllergy,
    update: profileService.updateAllergy,
    remove: profileService.deleteAllergy
  }
);

export const medicineHooks = createResourceHooks<MedicineDto, Omit<MedicineDto, "id">>(
  "medicines",
  {
    list: profileService.listMedicines,
    create: profileService.createMedicine,
    update: profileService.updateMedicine,
    remove: profileService.deleteMedicine
  }
);

export const familyHistoryHooks = createResourceHooks<
  FamilyHistoryDto,
  Omit<FamilyHistoryDto, "id">
>("family-history", {
  list: profileService.listFamilyHistory,
  create: profileService.createFamilyHistory,
  update: profileService.updateFamilyHistory,
  remove: profileService.deleteFamilyHistory
});
