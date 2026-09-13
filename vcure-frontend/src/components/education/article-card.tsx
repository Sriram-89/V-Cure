"use client";

import Link from "next/link";
import { Bookmark, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ArticleDifficultyBadge } from "@/components/education/article-difficulty-badge";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import type { ArticleSummary } from "@/types/education";

export function ArticleCard({
  article,
  onToggleBookmark
}: {
  article: ArticleSummary;
  onToggleBookmark?: (articleId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`${ROUTES.EDUCATION}/${article.id}`}
          className="min-w-0 flex-1 text-sm font-semibold text-text-primary hover:text-primary"
        >
          {article.title}
        </Link>
        {onToggleBookmark ? (
          <button
            type="button"
            aria-label={article.isBookmarked ? "Remove bookmark" : "Save for later"}
            aria-pressed={article.isBookmarked}
            onClick={() => onToggleBookmark(article.id)}
            className="shrink-0 rounded-full p-1.5 hover:bg-surface-muted"
          >
            <Bookmark
              className={cn(
                "h-4 w-4",
                article.isBookmarked ? "fill-primary text-primary" : "text-text-secondary"
              )}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>

      <p className="line-clamp-2 text-sm text-text-secondary">{article.excerpt}</p>

      <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {article.readingTimeMinutes} min read
        </span>
        <ArticleDifficultyBadge difficulty={article.difficulty} />
        <Badge variant="neutral">{article.topic}</Badge>
      </div>
    </div>
  );
}
