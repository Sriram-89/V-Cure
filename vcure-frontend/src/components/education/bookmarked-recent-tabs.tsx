"use client";

import { useState } from "react";
import { Bookmark, History } from "lucide-react";
import { cn } from "@/lib/cn";
import { ArticleGrid } from "@/components/education/article-grid";
import { useBookmarkedArticles, useRecentlyViewedArticles, useToggleBookmark } from "@/hooks/use-education";

export function BookmarkedRecentTabs() {
  const [tab, setTab] = useState<"bookmarked" | "recent">("bookmarked");
  const bookmarked = useBookmarkedArticles();
  const recent = useRecentlyViewedArticles();
  const toggleBookmark = useToggleBookmark();

  const active = tab === "bookmarked" ? bookmarked : recent;

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div role="tablist" className="flex gap-1 rounded-md bg-surface-muted p-1">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "bookmarked"}
          onClick={() => setTab("bookmarked")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium",
            tab === "bookmarked" ? "bg-surface text-primary shadow-card" : "text-text-secondary"
          )}
        >
          <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
          Saved
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "recent"}
          onClick={() => setTab("recent")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium",
            tab === "recent" ? "bg-surface text-primary shadow-card" : "text-text-secondary"
          )}
        >
          <History className="h-3.5 w-3.5" aria-hidden="true" />
          Recently viewed
        </button>
      </div>

      <div className="mt-4">
        <ArticleGrid
          articles={active.data}
          isLoading={active.isLoading}
          isError={active.isError}
          emptyLabel={
            tab === "bookmarked"
              ? "Articles you save will show up here."
              : "Articles you read will show up here."
          }
          onToggleBookmark={(id) => toggleBookmark.mutate(id)}
        />
      </div>
    </div>
  );
}
