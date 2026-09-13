import { educationAdapter } from "@/lib/education-adapter";
import type { ArticleFilters, EducationCategory } from "@/types/education";

export const educationService = {
  getCategories: () => educationAdapter.getCategories(),
  getTopics: (category?: EducationCategory) => educationAdapter.getTopics(category),
  getRecommended: () => educationAdapter.getRecommendedArticles(),
  getPersonalized: () => educationAdapter.getPersonalizedArticles(),
  getByCategory: (category: EducationCategory) => educationAdapter.getArticlesByCategory(category),
  search: (filters: ArticleFilters) => educationAdapter.searchArticles(filters),
  getDetail: (articleId: string) => educationAdapter.getArticleDetail(articleId),
  getRelated: (articleId: string) => educationAdapter.getRelatedArticles(articleId),
  toggleBookmark: (articleId: string) => educationAdapter.toggleBookmark(articleId),
  getBookmarked: () => educationAdapter.getBookmarkedArticles(),
  getRecentlyViewed: () => educationAdapter.getRecentlyViewed(),
  recordView: (articleId: string) => educationAdapter.recordView(articleId),
  getProgress: (articleId: string) => educationAdapter.getProgress(articleId),
  updateProgress: (articleId: string, percentRead: number) =>
    educationAdapter.updateProgress(articleId, percentRead)
};
