import { ArticleGrid } from "@/components/education/article-grid";
import { useRecommendedArticles, useToggleBookmark } from "@/hooks/use-education";

export function RecommendedContentSection() {
  const { data, isLoading, isError } = useRecommendedArticles();
  const toggleBookmark = useToggleBookmark();

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-text-primary">Recommended reading</h2>
      <ArticleGrid
        articles={data}
        isLoading={isLoading}
        isError={isError}
        emptyLabel="No recommendations available right now."
        onToggleBookmark={(id) => toggleBookmark.mutate(id)}
      />
    </div>
  );
}
