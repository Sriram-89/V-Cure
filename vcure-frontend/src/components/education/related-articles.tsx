import { ArticleGrid } from "@/components/education/article-grid";
import { useRelatedArticles, useToggleBookmark } from "@/hooks/use-education";

export function RelatedArticles({ articleId }: { articleId: string }) {
  const { data, isLoading, isError } = useRelatedArticles(articleId);
  const toggleBookmark = useToggleBookmark();

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-text-primary">Related content</h2>
      <ArticleGrid
        articles={data}
        isLoading={isLoading}
        isError={isError}
        emptyLabel="No related articles found."
        onToggleBookmark={(id) => toggleBookmark.mutate(id)}
      />
    </div>
  );
}
