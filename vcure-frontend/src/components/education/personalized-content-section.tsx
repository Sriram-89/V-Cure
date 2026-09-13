import { Sparkles } from "lucide-react";
import { ArticleGrid } from "@/components/education/article-grid";
import { usePersonalizedArticles, useToggleBookmark } from "@/hooks/use-education";

export function PersonalizedContentSection() {
  const { data, isLoading, isError } = usePersonalizedArticles();
  const toggleBookmark = useToggleBookmark();

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
        Picked for your profile
      </h2>
      <ArticleGrid
        articles={data}
        isLoading={isLoading}
        isError={isError}
        emptyLabel="Nothing personalized yet — keep building your profile."
        onToggleBookmark={(id) => toggleBookmark.mutate(id)}
      />
    </div>
  );
}
