import { BookOpen, AlertCircle } from "lucide-react";
import { ArticleCard } from "@/components/education/article-card";
import type { ArticleSummary } from "@/types/education";

export function ArticleGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-card bg-surface-muted" />
      ))}
    </div>
  );
}

export function ArticleGrid({
  articles,
  isLoading,
  isError,
  emptyLabel,
  onToggleBookmark
}: {
  articles: ArticleSummary[] | undefined;
  isLoading: boolean;
  isError: boolean;
  emptyLabel: string;
  onToggleBookmark: (articleId: string) => void;
}) {
  if (isLoading) return <ArticleGridSkeleton />;

  if (isError || !articles) {
    return (
      <div className="flex items-center gap-2 text-sm text-danger">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        Couldn&apos;t load articles.
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border py-10 text-center">
        <BookOpen className="h-6 w-6 text-text-secondary" aria-hidden="true" />
        <p className="text-sm text-text-secondary">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} onToggleBookmark={onToggleBookmark} />
      ))}
    </div>
  );
}
