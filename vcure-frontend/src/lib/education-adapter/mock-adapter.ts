import type { EducationAdapter } from "@/lib/education-adapter/types";
import { MOCK_ARTICLES } from "@/lib/education-adapter/mock-data";
import type {
  ArticleDetail,
  ArticleFilters,
  ArticleSummary,
  ContentProgress,
  EducationCategory
} from "@/types/education";

const SIMULATED_LATENCY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));
}

function toSummary(article: ArticleDetail): ArticleSummary {
  const { sections: _sections, relatedArticleIds: _related, ...summary } = article;
  return summary;
}

let articles: ArticleDetail[] = MOCK_ARTICLES.map((article) => ({ ...article }));
const recentlyViewedIds: string[] = [];
const progressByArticleId = new Map<string, ContentProgress>();

function findArticle(id: string): ArticleDetail {
  const article = articles.find((a) => a.id === id);
  if (!article) throw new Error(`Article ${id} not found`);
  return article;
}

export const mockEducationAdapter: EducationAdapter = {
  async getCategories(): Promise<EducationCategory[]> {
    return delay(["Nutrition", "Lifestyle", "Medical", "Preventive Health"]);
  },

  async getTopics(category?: EducationCategory): Promise<string[]> {
    const scoped = category ? articles.filter((a) => a.category === category) : articles;
    return delay(Array.from(new Set(scoped.map((a) => a.topic))));
  },

  async getRecommendedArticles() {
    return delay(articles.map(toSummary));
  },

  async getPersonalizedArticles() {
    return delay(articles.filter((a) => a.isPersonalized).map(toSummary));
  },

  async getArticlesByCategory(category: EducationCategory) {
    return delay(articles.filter((a) => a.category === category).map(toSummary));
  },

  async searchArticles(filters: ArticleFilters) {
    let results = articles;
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(
        (a) => a.title.toLowerCase().includes(query) || a.excerpt.toLowerCase().includes(query)
      );
    }
    if (filters.category) {
      results = results.filter((a) => a.category === filters.category);
    }
    if (filters.difficulty) {
      results = results.filter((a) => a.difficulty === filters.difficulty);
    }
    return delay(results.map(toSummary));
  },

  async getArticleDetail(articleId: string) {
    return delay({ ...findArticle(articleId) });
  },

  async getRelatedArticles(articleId: string) {
    const article = findArticle(articleId);
    return delay(
      article.relatedArticleIds
        .map((id) => articles.find((a) => a.id === id))
        .filter((a): a is ArticleDetail => Boolean(a))
        .map(toSummary)
    );
  },

  async toggleBookmark(articleId: string) {
    const article = findArticle(articleId);
    article.isBookmarked = !article.isBookmarked;
    return delay({ isBookmarked: article.isBookmarked });
  },

  async getBookmarkedArticles() {
    return delay(articles.filter((a) => a.isBookmarked).map(toSummary));
  },

  async getRecentlyViewed() {
    return delay(
      recentlyViewedIds
        .map((id) => articles.find((a) => a.id === id))
        .filter((a): a is ArticleDetail => Boolean(a))
        .map(toSummary)
    );
  },

  async recordView(articleId: string) {
    const existingIndex = recentlyViewedIds.indexOf(articleId);
    if (existingIndex !== -1) recentlyViewedIds.splice(existingIndex, 1);
    recentlyViewedIds.unshift(articleId);
    return delay(undefined);
  },

  async getProgress(articleId: string) {
    return delay(progressByArticleId.get(articleId) ?? null);
  },

  async updateProgress(articleId: string, percentRead: number) {
    const entry: ContentProgress = {
      articleId,
      percentRead: Math.max(0, Math.min(100, percentRead)),
      lastViewedAt: new Date().toISOString()
    };
    progressByArticleId.set(articleId, entry);
    return delay(entry);
  }
};
