import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RecipeService } from './recipe.service';
import { RecipeRepository } from './recipe.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { RecipeFiltersDto } from './dto/recipe.dto';

const R1 = '33333333-3333-4333-8333-333333333333';

describe('RecipeService', () => {
  let service: RecipeService;
  let prisma: any;

  const recipe = {
    id: R1,
    title: 'Masala Oats',
    category: { name: 'Breakfast' },
    imageQuery: 'masala oats',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    difficulty: 'EASY',
    calories: 320,
    dietTags: ['Vegetarian', 'High Fiber'],
  };

  beforeEach(async () => {
    prisma = {
      recipe: {
        findMany: jest.fn().mockResolvedValue([recipe]),
        findFirst: jest.fn().mockResolvedValue({ ...recipe, similarRecipes: [] }),
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        RecipeService,
        {
          provide: RecipeRepository,
          useValue: new RecipeRepository(prisma as unknown as PrismaService),
        },
      ],
    }).compile();
    service = moduleRef.get(RecipeService);
  });

  it('returns exactly the six ACC1 categories', () => {
    expect(service.getCategories()).toEqual([
      'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts', 'Beverages',
    ]);
  });

  it('maps to the ACC1 RecipeSummary shape', async () => {
    const [summary] = await service.searchRecipes({} as RecipeFiltersDto);
    expect(summary).toEqual({
      id: R1,
      title: 'Masala Oats',
      category: 'Breakfast',
      imageQuery: 'masala oats',
      cookingTimeMinutes: 15,
      difficulty: 'EASY',
      calories: 320,
      dietTags: ['Vegetarian', 'High Fiber'],
      averageRating: 0,
      ratingCount: 0,
      isFavorite: false,
    });
  });

  it('reports zero ratings because no review system exists — never a fabricated score', async () => {
    const [summary] = await service.searchRecipes({} as RecipeFiltersDto);
    expect(summary.averageRating).toBe(0);
    expect(summary.ratingCount).toBe(0);
  });

  it('excludes soft-deleted recipes', async () => {
    await service.searchRecipes({} as RecipeFiltersDto);
    expect(prisma.recipe.findMany.mock.calls[0][0].where.deletedAt).toBeNull();
  });

  it('filters by diet tag using array containment', async () => {
    await service.searchRecipes({ dietTag: 'Keto' } as RecipeFiltersDto);
    expect(prisma.recipe.findMany.mock.calls[0][0].where.dietTags).toEqual({ has: 'Keto' });
  });

  it('filters by category and difficulty only when supplied', async () => {
    await service.searchRecipes({} as RecipeFiltersDto);
    const where = prisma.recipe.findMany.mock.calls[0][0].where;
    expect(where.category).toBeUndefined();
    expect(where.difficulty).toBeUndefined();
  });

  it('aggregates ACC1 cookingTimeMinutes from ACC3 prep + cook, preserving both', async () => {
    const [summary] = await service.searchRecipes({} as RecipeFiltersDto);
    expect(summary.cookingTimeMinutes).toBe(15); // 5 prep + 10 cook
  });

  it('reads category through the canonical relation', async () => {
    await service.searchRecipes({ category: 'Dinner' } as RecipeFiltersDto);
    expect(prisma.recipe.findMany.mock.calls[0][0].where.category).toEqual({
      name: 'Dinner',
    });
  });

  it('returns curated similar recipes only', async () => {
    prisma.recipe.findFirst.mockResolvedValueOnce({
      ...recipe,
      similarRecipes: [{ ...recipe, id: 'other' }],
    });
    const result = await service.getSimilarRecipes(R1);
    expect(result.map((r) => r.id)).toEqual(['other']);
  });

  it('404s for an unknown recipe', async () => {
    prisma.recipe.findFirst.mockResolvedValueOnce(null);
    await expect(service.getSimilarRecipes(R1)).rejects.toThrow(NotFoundException);
  });
});

describe('RecipeFiltersDto validation', () => {
  const check = (raw: unknown) => validate(plainToInstance(RecipeFiltersDto, raw));

  it('accepts a documented category and diet tag', async () => {
    expect(await check({ category: 'Dinner', dietTag: 'Vegan' })).toHaveLength(0);
  });

  it('rejects an unknown category', async () => {
    expect(await check({ category: 'Brunch' })).not.toHaveLength(0);
  });

  it('rejects an unknown diet tag', async () => {
    expect(await check({ dietTag: 'Paleo' })).not.toHaveLength(0);
  });

  it('rejects an unknown difficulty', async () => {
    expect(await check({ difficulty: 'EXPERT' })).not.toHaveLength(0);
  });
});
