import type {
  ArticleDetail,
  ArticleFilters,
  ArticleSummary,
  ContentProgress,
  EducationCategory
} from "@/types/education";

export interface EducationAdapter {
  getCategories(): Promise<EducationCategory[]>;
  getTopics(category?: EducationCategory): Promise<string[]>;
  getRecommendedArticles(): Promise<ArticleSummary[]>;
  getPersonalizedArticles(): Promise<ArticleSummary[]>;
  getArticlesByCategory(category: EducationCategory): Promise<ArticleSummary[]>;
  searchArticles(filters: ArticleFilters): Promise<ArticleSummary[]>;
  getArticleDetail(articleId: string): Promise<ArticleDetail>;
  getRelatedArticles(articleId: string): Promise<ArticleSummary[]>;
  toggleBookmark(articleId: string): Promise<{ isBookmarked: boolean }>;
  getBookmarkedArticles(): Promise<ArticleSummary[]>;
  getRecentlyViewed(): Promise<ArticleSummary[]>;
  recordView(articleId: string): Promise<void>;
  getProgress(articleId: string): Promise<ContentProgress | null>;
  updateProgress(articleId: string, percentRead: number): Promise<ContentProgress>;
}
