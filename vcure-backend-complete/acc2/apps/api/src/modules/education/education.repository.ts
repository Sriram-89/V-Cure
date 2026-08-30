import { Injectable } from '@nestjs/common';
import { Article, ArticleProgress, Bookmark, Prisma } from '@prisma/client';
import { BaseRepository } from '../../database/base.repository';
import { PrismaTx } from '../../database/prisma-tx.type';

export interface ArticleSearchParams {
  category?: string;
  difficulty?: string;
  query?: string;
}

export type ArticleWithSections = Article & {
  category: { name: string } | null;
  sections: { heading: string; body: string; position: number }[];
  relatedArticles: { id: string }[];
};

/** Persistence for the Education domain (03 §41). */
@Injectable()
export class EducationRepository extends BaseRepository {
  findArticles(
    params: ArticleSearchParams,
    tx?: PrismaTx,
  ): Promise<Article[]> {
    const where: Prisma.ArticleWhereInput = {
      deletedAt: null,
      ...(params.category ? { category: { name: params.category } } : {}),
      ...(params.difficulty ? { difficulty: params.difficulty } : {}),
      ...(params.query
        ? {
            OR: [
              { title: { contains: params.query, mode: 'insensitive' } },
              { excerpt: { contains: params.query, mode: 'insensitive' } },
              { topic: { contains: params.query, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    return this.db(tx).article.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findArticleById(
    id: string,
    tx?: PrismaTx,
  ): Promise<ArticleWithSections | null> {
    return this.db(tx).article.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: { select: { name: true } },
        sections: {
          where: { deletedAt: null },
          orderBy: { position: 'asc' },
          select: { heading: true, body: true, position: true },
        },
        relatedArticles: { where: { deletedAt: null }, select: { id: true } },
      },
    }) as Promise<ArticleWithSections | null>;
  }

  findArticlesByIds(ids: string[], tx?: PrismaTx): Promise<Article[]> {
    return this.db(tx).article.findMany({
      where: { id: { in: ids }, deletedAt: null },
      include: { category: { select: { name: true } } },
    });
  }

  /** Distinct topics, optionally scoped to a category. */
  async findDistinctTopics(category?: string, tx?: PrismaTx): Promise<string[]> {
    const rows = await this.db(tx).article.findMany({
      where: { deletedAt: null, ...(category ? { category: { name: category } } : {}) },
      distinct: ['topic'],
      select: { topic: true },
      orderBy: { topic: 'asc' },
    });
    return rows.map((r: { topic: string }) => r.topic);
  }

  // --- Bookmarks ---
  findBookmark(
    userId: string,
    articleId: string,
    tx?: PrismaTx,
  ): Promise<Bookmark | null> {
    return this.db(tx).bookmark.findFirst({ where: { userId, articleId } });
  }

  findBookmarksForUser(userId: string, tx?: PrismaTx): Promise<Bookmark[]> {
    return this.db(tx).bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  createBookmark(userId: string, articleId: string, tx?: PrismaTx): Promise<Bookmark> {
    return this.db(tx).bookmark.create({ data: { userId, articleId } });
  }

  /**
   * ACC3's canonical Bookmark has no `deletedAt`, so un-bookmarking removes the
   * row. The ACC1 toggle contract is unchanged.
   */
  deleteBookmark(id: string, tx?: PrismaTx): Promise<Bookmark> {
    return this.db(tx).bookmark.delete({ where: { id } });
  }

  // --- Learning progress / view history ---
  findProgress(
    userId: string,
    articleId: string,
    tx?: PrismaTx,
  ): Promise<ArticleProgress | null> {
    return this.db(tx).articleProgress.findFirst({
      where: { userId, articleId },
    });
  }

  upsertProgress(
    userId: string,
    articleId: string,
    data: Prisma.ArticleProgressUncheckedUpdateInput,
    tx?: PrismaTx,
  ): Promise<ArticleProgress> {
    return this.db(tx).articleProgress.upsert({
      where: { userId_articleId: { userId, articleId } },
      create: { userId, articleId, ...(data as object) },
      update: data,
    });
  }

  findRecentlyViewed(
    userId: string,
    take: number,
    tx?: PrismaTx,
  ): Promise<ArticleProgress[]> {
    return this.db(tx).articleProgress.findMany({
      where: { userId },
      orderBy: { lastViewedAt: 'desc' },
      take,
    });
  }
}
