import { MealCard } from "@/components/meals/meal-card";
import { MealListSkeleton } from "@/components/meals/meal-skeletons";
import { useAlternativeMeals, useToggleFavorite } from "@/hooks/use-meals";

export function AlternativeMealsList({
  mealId,
  onSelect
}: {
  mealId: string;
  onSelect: (mealId: string) => void;
}) {
  const { data, isLoading, isError } = useAlternativeMeals(mealId);
  const toggleFavorite = useToggleFavorite();

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
        Alternatives
      </h3>
      <div className="mt-2">
        {isLoading ? (
          <MealListSkeleton count={2} />
        ) : isError || !data ? (
          <p className="text-sm text-danger">Couldn&apos;t load alternatives.</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-text-secondary">No alternatives suggested for this meal.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {data.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onSelect={onSelect}
                onToggleFavorite={(id) => toggleFavorite.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
