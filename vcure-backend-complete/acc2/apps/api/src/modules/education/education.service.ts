import { Injectable, NotFoundException } from '@nestjs/common';
import { Article } from '@prisma/client';
import { EducationRepository, ArticleWithSections } from './education.repository';
import { ArticleFiltersDto, UpdateProgressDto } from './dto/education.dto';
import {
  ArticleDetailResponse,
  ArticleSummaryResponse,
  ContentProgressResponse,
  EDUCATION_CATEGORIES,
} from './types/education.type';

const RECENTLY_VIEWED_LIMIT = 10;

@Injectable()
export class EducationService {
  constructor(private readonly repository: EducationRepository) {}

  /** ACC1 `getCategories`. The closed set defined by ACC1's EducationCategory. */
  getCategories(): string[] {
    return [...EDUCATION_CATEGORIES];
  }

  /** ACC1 `getTopics(category?)`. Distinct topics actually present. */
  getTopics(category?: string): Promise<string[]> {
    return this.repository.findDistinctTopics(category);
  }

  /** ACC1 `searchArticles(filters)` and `getArticlesByCategory(category)`. */
  async searchArticles(
    userId: string,
    filters: ArticleFiltersDto,
  ): Promise<ArticleSummaryResponse[]> {
    const articles = await this.repository.findArticles(filters);
    return this.withBookmarkState(userId, articles);
  }

  async getArticleDetail(
    userId: string,
    articleId: string,
  ): Promise<ArticleDetailResponse> {
    const article = await this.requireArticle(articleId);
    const bookmarked = await this.bookmarkedIds(userId);
    return {
      ...this.toSummary(article, bookmarked.has(article.id)),
      sections: article.sections.map((s: { heading: string; body: string }) => ({
        heading: s.heading,
        body: s.body,
      })),
      relatedArticleIds: article.relatedArticles.map((r: { id: string }) => r.id),
    };
  }

  /**
   * ACC1 `getRelatedArticles`. Returns the curated self-relation only — no
   * similarity scoring or ranking, because no such contract exists.
   */
  async getRelatedArticles(
    userId: string,
    articleId: string,
  ): Promise<ArticleSummaryResponse[]> {
    const article = await this.requireArticle(articleId);
    const ids = article.relatedArticles.map((r: { id: string }) => r.id);
    if (ids.length === 0) return [];
    const related = await this.repository.findArticlesByIds(ids);
    return this.withBookmarkState(userId, related);
  }

  /**
   * ACC1 `toggleBookmark`. Soft-deleted bookmarks are restored rather than
   * duplicated, keeping the (userId, articleId) uniqueness intact.
   */
  async toggleBookmark(
    userId: string,
    articleId: string,
  ): Promise<{ isBookmarked: boolean }> {
    await this.requireArticle(articleId);
    const existing = await this.repository.findBookmark(userId, articleId);

    if (!existing) {
      await this.repository.createBookmark(userId, articleId);
      return { isBookmarked: true };
    }
    // ACC3's canonical Bookmark has no deletedAt — un-bookmarking removes it.
    await this.repository.deleteBookmark(existing.id);
    return { isBookmarked: false };
  }

  async getBookmarkedArticles(userId: string): Promise<ArticleSummaryResponse[]> {
    const bookmarks = await this.repository.findBookmarksForUser(userId);
    if (bookmarks.length === 0) return [];
    const articleIds = bookmarks
      .map((b) => b.articleId)
      .filter((id): id is string => Boolean(id));
    if (articleIds.length === 0) return [];
    const articles = await this.repository.findArticlesByIds(articleIds);
    return articles.map((a) => this.toSummary(a, true));
  }

  /** ACC1 `recordView`. Touches lastViewedAt without altering percentRead. */
  async recordView(userId: string, articleId: string): Promise<void> {
    await this.requireArticle(articleId);
    await this.repository.upsertProgress(userId, articleId, {
      lastViewedAt: new Date(),
    });
  }

  async getProgress(
    userId: string,
    articleId: string,
  ): Promise<ContentProgressResponse | null> {
    const progress = await this.repository.findProgress(userId, articleId);
    if (!progress) return null;
    return {
      articleId: progress.articleId,
      percentRead: progress.percentRead,
      lastViewedAt: progress.lastViewedAt,
    };
  }

  async updateProgress(
    userId: string,
    articleId: string,
    dto: UpdateProgressDto,
  ): Promise<ContentProgressResponse> {
    await this.requireArticle(articleId);
    const saved = await this.repository.upsertProgress(userId, articleId, {
      percentRead: dto.percentRead,
      lastViewedAt: new Date(),
    });
    return {
      articleId: saved.articleId,
      percentRead: saved.percentRead,
      lastViewedAt: saved.lastViewedAt,
    };
  }

  async getRecentlyViewed(userId: string): Promise<ArticleSummaryResponse[]> {
    const recent = await this.repository.findRecentlyViewed(
      userId,
      RECENTLY_VIEWED_LIMIT,
    );
    if (recent.length === 0) return [];
    const articles = await this.repository.findArticlesByIds(
      recent.map((r) => r.articleId),
    );
    // Preserve recency order from the progress rows.
    const byId = new Map(articles.map((a) => [a.id, a]));
    const ordered = recent
      .map((r) => byId.get(r.articleId))
      .filter((a): a is Article => Boolean(a));
    return this.withBookmarkState(userId, ordered);
  }

  // ------------------------------------------------------------------ helpers
  private async requireArticle(articleId: string): Promise<ArticleWithSections> {
    const article = await this.repository.findArticleById(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  private async bookmarkedIds(userId: string): Promise<Set<string>> {
    const bookmarks = await this.repository.findBookmarksForUser(userId);
    return new Set(
      bookmarks
        .map((b) => b.articleId)
        .filter((id): id is string => Boolean(id)),
    );
  }

  private async withBookmarkState(
    userId: string,
    articles: Article[],
  ): Promise<ArticleSummaryResponse[]> {
    const bookmarked = await this.bookmarkedIds(userId);
    return articles.map((a) => this.toSummary(a, bookmarked.has(a.id)));
  }

  /**
   * `isPersonalized` is always false: no personalisation contract exists, so
   * no article is personalised. This reports the true current state rather
   * than fabricating a ranking signal. See EDUCATION-BLOCKED.
   */
  private toSummary(
    article: Article & { category?: { name: string } | null },
    isBookmarked: boolean,
  ): ArticleSummaryResponse {
    return {
      id: article.id,
      title: article.title,
      // ACC3 canonicalises category as a relation; ACC1 expects the name.
      category: article.category?.name ?? '',
      // The ACC1 presentation columns are nullable in canonical storage
      // (an ACC3-authored article may not carry them). Empty values are
      // returned rather than fabricated copy or invented reading times.
      topic: article.topic ?? '',
      imageQuery: article.imageQuery ?? '',
      readingTimeMinutes: article.readingTimeMinutes ?? 0,
      difficulty: article.difficulty ?? 'BEGINNER',
      excerpt: article.excerpt ?? '',
      isBookmarked,
      isPersonalized: false,
    };
  }
}
