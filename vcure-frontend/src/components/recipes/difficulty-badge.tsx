import { Badge } from "@/components/ui/badge";
import type { RecipeDifficulty } from "@/types/recipes";

const DIFFICULTY_CONFIG: Record<RecipeDifficulty, { label: string; variant: "primary" | "secondary" | "neutral" }> = {
  EASY: { label: "Easy", variant: "primary" },
  MEDIUM: { label: "Medium", variant: "secondary" },
  HARD: { label: "Hard", variant: "neutral" }
};

export function DifficultyBadge({ difficulty }: { difficulty: RecipeDifficulty }) {
  const config = DIFFICULTY_CONFIG[difficulty];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
