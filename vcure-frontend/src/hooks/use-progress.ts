import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { progressService } from "@/services/progress-service";
import type { DateRangePreset } from "@/types/progress";

export function useProgressSummary() {
  return useQuery({ queryKey: ["progress", "summary"], queryFn: progressService.getSummary });
}

export function useWeightHistory(range: DateRangePreset) {
  return useQuery({
    queryKey: ["progress", "weight", range],
    queryFn: () => progressService.getWeightHistory(range)
  });
}

export function useBmiHistory(range: DateRangePreset) {
  return useQuery({
    queryKey: ["progress", "bmi", range],
    queryFn: () => progressService.getBmiHistory(range)
  });
}

export function useCalorieHistory(range: DateRangePreset) {
  return useQuery({
    queryKey: ["progress", "calories", range],
    queryFn: () => progressService.getCalorieHistory(range)
  });
}

export function useWaterHistory(range: DateRangePreset) {
  return useQuery({
    queryKey: ["progress", "water", range],
    queryFn: () => progressService.getWaterHistory(range)
  });
}

export function useMealTrackingHistory(range: DateRangePreset) {
  return useQuery({
    queryKey: ["progress", "meal-tracking", range],
    queryFn: () => progressService.getMealTrackingHistory(range)
  });
}

export function useNutritionProgress(range: DateRangePreset) {
  return useQuery({
    queryKey: ["progress", "nutrition", range],
    queryFn: () => progressService.getNutritionProgress(range)
  });
}

export function useGoalProgress() {
  return useQuery({ queryKey: ["progress", "goal"], queryFn: progressService.getGoalProgress });
}

export function useHealthScoreHistory(range: DateRangePreset) {
  return useQuery({
    queryKey: ["progress", "health-score", range],
    queryFn: () => progressService.getHealthScoreHistory(range)
  });
}

export function useMilestones() {
  return useQuery({ queryKey: ["progress", "milestones"], queryFn: progressService.getMilestones });
}

export function useLogWeight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (weightKg: number) => progressService.logWeight(weightKg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress", "weight"] });
      queryClient.invalidateQueries({ queryKey: ["progress", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["progress", "bmi"] });
    }
  });
}
