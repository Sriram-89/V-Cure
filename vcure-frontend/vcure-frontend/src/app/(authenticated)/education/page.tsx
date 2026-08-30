"use client";

import { Container } from "@/components/ui/container";
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

export default function EducationDashboardPage() {
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
    <Container className="max-w-5xl py-8">
      <h1 className="text-2xl font-semibold text-text-primary">Education</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Nutrition, lifestyle, medical, and preventive health — explained plainly.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <EducationCategoryTabs activeCategory={activeCategory} onSelect={setActiveCategory} />

          <div className="rounded-card border border-border bg-surface p-6 shadow-card">
            <ArticleSearchFilters filters={filters} onChange={setFilters} />
          </div>

          {showFilteredGrid ? (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-text-primary">
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
              <h2 className="mb-3 text-sm font-semibold text-text-primary">All articles</h2>
              <ArticleGrid
                articles={recommended.data}
                isLoading={recommended.isLoading}
                isError={recommended.isError}
                emptyLabel="No articles available right now."
                onToggleBookmark={(id) => toggleBookmark.mutate(id)}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <PersonalizedContentSection />
          <BookmarkedRecentTabs />
        </div>
      </div>
    </Container>
  );
}
