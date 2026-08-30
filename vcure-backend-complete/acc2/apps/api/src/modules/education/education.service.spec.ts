import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { EducationService } from './education.service';
import { EducationRepository } from './education.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { ArticleFiltersDto, UpdateProgressDto } from './dto/education.dto';

const A1 = '11111111-1111-4111-8111-111111111111';
const A2 = '22222222-2222-4222-8222-222222222222';

describe('EducationService', () => {
  let service: EducationService;
  let prisma: any;
  const userId = 'user_1';

  const article = {
    id: A1,
    title: 'Understanding Fibre',
    category: { name: 'Nutrition' },
    topic: 'Macronutrients',
    imageQuery: 'fibre foods',
    readingTimeMinutes: 6,
    difficulty: 'BEGINNER',
    excerpt: 'Why fibre matters.',
    sections: [{ heading: 'Intro', body: 'Body text', position: 0 }],
    relatedArticles: [{ id: A2 }],
  };

  beforeEach(async () => {
    prisma = {
      article: {
        findMany: jest.fn().mockResolvedValue([article]),
        findFirst: jest.fn().mockResolvedValue(article),
      },
      bookmark: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'bm_1' }),
        delete: jest.fn().mockResolvedValue({ id: 'bm_1' }),
      },
      articleProgress: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        upsert: jest.fn().mockResolvedValue({
          articleId: A1,
          percentRead: 40,
          lastViewedAt: new Date('2026-03-01T00:00:00.000Z'),
        }),
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        EducationService,
        {
          provide: EducationRepository,
          useValue: new EducationRepository(prisma as unknown as PrismaService),
        },
      ],
    }).compile();
    service = moduleRef.get(EducationService);
  });

  it('returns exactly the four ACC1 categories', () => {
    expect(service.getCategories()).toEqual([
      'Nutrition',
      'Lifestyle',
      'Medical',
      'Preventive Health',
    ]);
  });

  it('returns distinct topics, scoped by category when given', async () => {
    prisma.article.findMany.mockResolvedValueOnce([{ topic: 'Macronutrients' }]);
    const topics = await service.getTopics('Nutrition');
    expect(topics).toEqual(['Macronutrients']);
    const arg = prisma.article.findMany.mock.calls[0][0];
    expect(arg.distinct).toEqual(['topic']);
    // ACC3 canonicalises category as a relation.
    expect(arg.where.category).toEqual({ name: 'Nutrition' });
  });

  it('maps search results to the ACC1 ArticleSummary shape', async () => {
    const [summary] = await service.searchArticles(userId, {} as ArticleFiltersDto);
    expect(summary).toEqual({
      id: A1,
      title: 'Understanding Fibre',
      category: 'Nutrition',
      topic: 'Macronutrients',
      imageQuery: 'fibre foods',
      readingTimeMinutes: 6,
      difficulty: 'BEGINNER',
      excerpt: 'Why fibre matters.',
      isBookmarked: false,
      isPersonalized: false,
    });
  });

  it('never claims an article is personalised — no personalisation exists', async () => {
    const results = await service.searchArticles(userId, {} as ArticleFiltersDto);
    expect(results.every((a) => a.isPersonalized === false)).toBe(true);
  });

  it('excludes soft-deleted articles and searches title, excerpt and topic', async () => {
    await service.searchArticles(userId, { query: 'fibre' } as ArticleFiltersDto);
    const where = prisma.article.findMany.mock.calls[0][0].where;
    expect(where.deletedAt).toBeNull();
    expect(where.OR).toHaveLength(3);
  });

  it('reflects bookmark state in list results', async () => {
    prisma.bookmark.findMany.mockResolvedValueOnce([{ articleId: A1 }]);
    const [summary] = await service.searchArticles(userId, {} as ArticleFiltersDto);
    expect(summary.isBookmarked).toBe(true);
  });

  it('returns detail with ordered sections and related ids', async () => {
    const detail = await service.getArticleDetail(userId, A1);
    expect(detail.sections).toEqual([{ heading: 'Intro', body: 'Body text' }]);
    expect(detail.relatedArticleIds).toEqual([A2]);
    expect(prisma.article.findFirst.mock.calls[0][0].include.sections.orderBy).toEqual({
      position: 'asc',
    });
  });

  it('404s for an unknown article', async () => {
    prisma.article.findFirst.mockResolvedValueOnce(null);
    await expect(service.getArticleDetail(userId, A1)).rejects.toThrow(NotFoundException);
  });

  it('returns curated related articles only — no ranking', async () => {
    prisma.article.findMany.mockResolvedValueOnce([{ ...article, id: A2 }]);
    const related = await service.getRelatedArticles(userId, A1);
    expect(related.map((r) => r.id)).toEqual([A2]);
    expect(prisma.article.findMany.mock.calls[0][0].where.id).toEqual({ in: [A2] });
  });

  it('returns [] when an article has no curated relations', async () => {
    prisma.article.findFirst.mockResolvedValueOnce({ ...article, relatedArticles: [] });
    expect(await service.getRelatedArticles(userId, A1)).toEqual([]);
  });

  describe('toggleBookmark', () => {
    it('creates a bookmark when none exists', async () => {
      const result = await service.toggleBookmark(userId, A1);
      expect(prisma.bookmark.create).toHaveBeenCalledWith({
        data: { userId, articleId: A1 },
      });
      expect(result).toEqual({ isBookmarked: true });
    });

    it('removes the bookmark row when toggled off (ACC3 has no deletedAt)', async () => {
      prisma.bookmark.findFirst.mockResolvedValueOnce({ id: 'bm_1' });
      const result = await service.toggleBookmark(userId, A1);
      expect(prisma.bookmark.delete).toHaveBeenCalledWith({ where: { id: 'bm_1' } });
      expect(prisma.bookmark.create).not.toHaveBeenCalled();
      expect(result).toEqual({ isBookmarked: false });
    });

    it('re-creates rather than duplicating when toggled back on', async () => {
      prisma.bookmark.findFirst.mockResolvedValueOnce(null);
      const result = await service.toggleBookmark(userId, A1);
      expect(prisma.bookmark.create).toHaveBeenCalledWith({
        data: { userId, articleId: A1 },
      });
      expect(result).toEqual({ isBookmarked: true });
    });
  });

  describe('progress and view history', () => {
    it('recordView touches lastViewedAt without altering percentRead', async () => {
      await service.recordView(userId, A1);
      const arg = prisma.articleProgress.upsert.mock.calls[0][0];
      expect(arg.update).toHaveProperty('lastViewedAt');
      expect(arg.update).not.toHaveProperty('percentRead');
      expect(arg.where).toEqual({ userId_articleId: { userId, articleId: A1 } });
    });

    it('returns null progress when the article was never opened', async () => {
      expect(await service.getProgress(userId, A1)).toBeNull();
    });

    it('persists percentRead and refreshes lastViewedAt', async () => {
      const result = await service.updateProgress(userId, A1, {
        percentRead: 40,
      } as UpdateProgressDto);
      expect(prisma.articleProgress.upsert.mock.calls[0][0].update.percentRead).toBe(40);
      expect(result.percentRead).toBe(40);
    });

    it('orders recently-viewed by recency, not by article creation', async () => {
      prisma.articleProgress.findMany.mockResolvedValueOnce([
        { articleId: A2 },
        { articleId: A1 },
      ]);
      prisma.article.findMany.mockResolvedValueOnce([
        { ...article, id: A1 },
        { ...article, id: A2 },
      ]);
      const result = await service.getRecentlyViewed(userId);
      expect(result.map((a) => a.id)).toEqual([A2, A1]);
    });

    it('returns [] when nothing has been viewed', async () => {
      expect(await service.getRecentlyViewed(userId)).toEqual([]);
    });
  });
});

describe('Education DTO validation', () => {
  const check = (cls: any, raw: unknown) => validate(plainToInstance(cls, raw));

  it.each(['Nutrition', 'Lifestyle', 'Medical', 'Preventive Health'])(
    'accepts category %s',
    async (category) => {
      expect(await check(ArticleFiltersDto, { category })).toHaveLength(0);
    },
  );

  it('rejects an unknown category', async () => {
    const errors = await check(ArticleFiltersDto, { category: 'Fitness' });
    expect(errors.some((e) => e.property === 'category')).toBe(true);
  });

  it('rejects an unknown difficulty', async () => {
    const errors = await check(ArticleFiltersDto, { difficulty: 'EXPERT' });
    expect(errors.some((e) => e.property === 'difficulty')).toBe(true);
  });

  it.each([0, 50, 100])('accepts percentRead %i', async (percentRead) => {
    expect(await check(UpdateProgressDto, { percentRead })).toHaveLength(0);
  });

  it.each([-1, 101])('rejects out-of-range percentRead %i', async (percentRead) => {
    expect(await check(UpdateProgressDto, { percentRead })).not.toHaveLength(0);
  });
});
