import { Badge } from "@/components/ui/badge";
import type { ArticleDifficulty } from "@/types/education";

const CONFIG: Record<ArticleDifficulty, { label: string; variant: "primary" | "secondary" | "neutral" }> = {
  BEGINNER: { label: "Beginner", variant: "primary" },
  INTERMEDIATE: { label: "Intermediate", variant: "secondary" },
  ADVANCED: { label: "Advanced", variant: "neutral" }
};

export function ArticleDifficultyBadge({ difficulty }: { difficulty: ArticleDifficulty }) {
  const config = CONFIG[difficulty];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
