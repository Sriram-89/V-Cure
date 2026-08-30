import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mealService } from "@/services/meal-service";
import type { MealFilters, MealSlot } from "@/types/meals";

export function useDayPlan(date: string) {
  return useQuery({
    queryKey: ["meals", "day-plan", date],
    queryFn: () => mealService.getDayPlan(date)
  });
}

export function useRecommendedMeals(slot: MealSlot) {
  return useQuery({
    queryKey: ["meals", "recommended", slot],
    queryFn: () => mealService.getRecommended(slot)
  });
}

export function useAlternativeMeals(mealId: string | null) {
  return useQuery({
    queryKey: ["meals", "alternatives", mealId],
    queryFn: () => mealService.getAlternatives(mealId as string),
    enabled: Boolean(mealId)
  });
}

export function useMealSearch(filters: MealFilters) {
  return useQuery({
    queryKey: ["meals", "search", filters],
    queryFn: () => mealService.search(filters)
  });
}

export function useMealDetail(mealId: string | null) {
  return useQuery({
    queryKey: ["meals", "detail", mealId],
    queryFn: () => mealService.getDetail(mealId as string),
    enabled: Boolean(mealId)
  });
}

export function useFavoriteMeals() {
  return useQuery({ queryKey: ["meals", "favorites"], queryFn: mealService.getFavorites });
}

export function useRecentMeals() {
  return useQuery({ queryKey: ["meals", "recent"], queryFn: mealService.getRecent });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mealId: string) => mealService.toggleFavorite(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    }
  });
}

export function useLogMealConsumed(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mealId: string) => mealService.logConsumed(mealId, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", "recent"] });
      queryClient.invalidateQueries({ queryKey: ["meals", "day-plan", date] });
    }
  });
}

export function useLogWaterIntake(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amountMl: number) => mealService.logWater(date, amountMl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", "day-plan", date] });
    }
  });
}
