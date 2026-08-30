import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AllergenTag, DietTag } from "@/types/nutrition";

export function AllergensList({ allergens }: { allergens: AllergenTag[] }) {
  if (allergens.length === 0) {
    return (
      <p className="text-sm text-text-secondary">No common allergens listed for this recipe.</p>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-md bg-red-50 p-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
      <div className="flex flex-wrap gap-1.5">
        {allergens.map((allergen) => (
          <Badge key={allergen} variant="neutral">
            {allergen}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function DietaryTags({ tags }: { tags: DietTag[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge key={tag} variant="primary">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
