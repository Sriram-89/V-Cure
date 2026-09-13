"use client";

import { use, useEffect, useRef } from "react";
import { Bookmark, Clock, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ArticleDifficultyBadge } from "@/components/education/article-difficulty-badge";
import { ReadingProgressBar } from "@/components/education/reading-progress-bar";
import { RelatedArticles } from "@/components/education/related-articles";
import { cn } from "@/lib/cn";
import {
  useArticleDetail,
  useToggleBookmark,
  useRecordArticleView
} from "@/hooks/use-education";

export default function ArticleDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: article, isLoading, isError } = useArticleDetail(id);
  const toggleBookmark = useToggleBookmark();
  const recordView = useRecordArticleView();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    recordView.mutate(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <Container className="max-w-2xl py-8">
        <div className="h-8 w-2/3 animate-pulse rounded bg-surface-muted" />
        <div className="mt-6 h-64 animate-pulse rounded-card bg-surface-muted" />
      </Container>
    );
  }

  if (isError || !article) {
    return (
      <Container className="max-w-2xl py-16">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="h-8 w-8 text-danger" aria-hidden="true" />
          <p className="text-sm text-text-secondary">Couldn&apos;t load this article.</p>
        </div>
      </Container>
    );
  }

  return (
    <>
      <ReadingProgressBar articleId={article.id} contentRef={contentRef} />
      <Container className="max-w-2xl py-8">
        <div ref={contentRef} className="flex flex-col gap-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-semibold text-text-primary">{article.title}</h1>
              <button
                type="button"
                aria-label={article.isBookmarked ? "Remove bookmark" : "Save for later"}
                aria-pressed={article.isBookmarked}
                onClick={() => toggleBookmark.mutate(article.id)}
                className="shrink-0 rounded-full p-2 hover:bg-surface-muted"
              >
                <Bookmark
                  className={cn(
                    "h-5 w-5",
                    article.isBookmarked ? "fill-primary text-primary" : "text-text-secondary"
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {article.readingTimeMinutes} min read
              </span>
              <ArticleDifficultyBadge difficulty={article.difficulty} />
              <Badge variant="neutral">{article.category}</Badge>
              <Badge variant="neutral">{article.topic}</Badge>
            </div>

            <p className="mt-4 text-sm text-text-secondary">{article.excerpt}</p>
          </div>

          <div className="flex flex-col gap-6">
            {article.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="text-base font-semibold text-text-primary">{section.heading}</h2>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{section.body}</p>
              </div>
            ))}
          </div>

          <RelatedArticles articleId={article.id} />
        </div>
      </Container>
    </>
  );
}
