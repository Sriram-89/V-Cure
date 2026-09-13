"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { BackButton } from "@/components/ui/back-button";
import { EducationCategoryTabs } from "@/components/education/education-category-tabs";
import { ArticleSearchFilters } from "@/components/education/article-search-filters";
import { ArticleGrid } from "@/components/education/article-grid";
import { PersonalizedContentSection } from "@/components/education/personalized-content-section";
import { BookmarkedRecentTabs } from "@/components/education/bookmarked-recent-tabs";
import {
  useArticlesByCategory,
  useArticleSearch,
  useRecommendedArticles,
  useToggleBookmark
} from "@/hooks/use-education";
import { useEducationStore } from "@/store/education-store";
import { useSwipeBack } from "@/hooks/use-swipe-back";

export default function EducationDashboardPage() {
  useSwipeBack("/dashboard");
  const activeCategory = useEducationStore((state) => state.activeCategory);
  const setActiveCategory = useEducationStore((state) => state.setActiveCategory);
  const filters = useEducationStore((state) => state.filters);
  const setFilters = useEducationStore((state) => state.setFilters);
  const toggleBookmark = useToggleBookmark();

  const hasActiveFilters = Boolean(filters.query || filters.difficulty);
  const byCategory = useArticlesByCategory(activeCategory);
  const searchResults = useArticleSearch(filters);
  const recommended = useRecommendedArticles();

  const showFilteredGrid = hasActiveFilters || activeCategory !== null;
  const filteredList = hasActiveFilters ? searchResults : byCategory;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Container className="max-w-md px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <BackButton fallbackUrl="/dashboard" />
          <h1 className="text-xl font-extrabold text-gray-900">Education</h1>
          <Link
            href="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white shrink-0 shadow-xs hover:bg-slate-700 transition-all"
            aria-label="Profile"
          >
            S
          </Link>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500">
            Nutrition, lifestyle, medical, and preventive health — explained plainly.
          </p>
        </div>

        <EducationCategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} />

        <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-md">
          <ArticleSearchFilters filters={filters} onChange={setFilters} />
        </div>

        {showFilteredGrid ? (
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-700">
              {hasActiveFilters ? "Search results" : activeCategory}
            </h2>
            <ArticleGrid
              articles={filteredList.data}
              isLoading={filteredList.isLoading}
              isError={filteredList.isError}
              emptyLabel="No articles match right now."
              onToggleBookmark={(id) => toggleBookmark.mutate(id)}
            />
          </div>
        ) : (
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-700">All articles</h2>
            <ArticleGrid
              articles={recommended.data}
              isLoading={recommended.isLoading}
              isError={recommended.isError}
              emptyLabel="No articles available right now."
              onToggleBookmark={(id) => toggleBookmark.mutate(id)}
            />
          </div>
        )}

        <div className="space-y-4 pt-2">
          <PersonalizedContentSection />
          <BookmarkedRecentTabs />
        </div>
      </Container>
    </div>
  );
}
