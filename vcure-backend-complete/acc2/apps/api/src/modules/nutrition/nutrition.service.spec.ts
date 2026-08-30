import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NutritionService } from './nutrition.service';
import { NutritionRepository } from './nutrition.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { FoodSearchDto } from './dto/food-search.dto';

const F1 = '44444444-4444-4444-8444-444444444444';

/** Canonical ACC3 Food graph. */
const food = {
  id: F1,
  name: 'Moong Dal',
  isVegetarian: true,
  isVegan: true,
  category: { name: 'Pulses' },
  nutrition: {
    caloriesKcal: 347,
    proteinG: 24,
    carbsG: 59,
    fatG: 1.2,
    micronutrients: [
      { amount: 3.9, micronutrient: { name: 'Iron', unit: 'mg' } },
    ],
  },
  servings: [{ servingName: '100 g uncooked', gramsEquivalent: 100 }],
};

describe('NutritionService — canonical ACC3 Food graph', () => {
  let service: NutritionService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      food: {
        findMany: jest.fn().mockResolvedValue([food]),
        findFirst: jest.fn().mockResolvedValue(food),
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        NutritionService,
        {
          provide: NutritionRepository,
          useValue: new NutritionRepository(prisma as unknown as PrismaService),
        },
      ],
    }).compile();
    service = moduleRef.get(NutritionService);
  });

  it('preserves the ACC1 summary shape from canonical storage', async () => {
    const [summary] = await service.searchFoods({} as FoodSearchDto);
    expect(summary).toEqual({
      id: F1,
      name: 'Moong Dal',
      category: 'Pulses',
      calories: 347,
      dietTags: ['Vegetarian', 'Vegan'],
      allergenTags: [],
    });
  });

  it('reads category through the canonical FoodCategory relation', async () => {
    await service.searchFoods({ category: 'Pulses' } as FoodSearchDto);
    expect(prisma.food.findMany.mock.calls[0][0].where.category).toEqual({
      name: 'Pulses',
    });
  });

  it('builds NutritionBreakdown from FoodNutrition — RULE-007, nothing computed', async () => {
    const detail = await service.getFoodDetail(F1);
    expect(detail.nutrition).toEqual({
      calories: 347,
      macros: { proteinG: 24, carbsG: 59, fatG: 1.2 },
      micronutrients: [
        { name: 'Iron', amount: '3.9 mg', percentOfDailyValue: 0 },
      ],
    });
  });

  it('composes micronutrient display value from canonical amount + unit', async () => {
    const detail = await service.getFoodDetail(F1);
    expect(detail.nutrition.micronutrients[0].amount).toBe('3.9 mg');
  });

  it('maps PortionSize from the canonical FoodServing row', async () => {
    const detail = await service.getFoodDetail(F1);
    expect(detail.portion).toEqual({
      amount: 100,
      unit: 'g',
      description: '100 g uncooked',
    });
  });

  it('derives only the diet tags ACC3 actually stores — never inferred', async () => {
    prisma.food.findMany.mockResolvedValueOnce([
      { ...food, isVegetarian: true, isVegan: false },
    ]);
    const [summary] = await service.searchFoods({} as FoodSearchDto);
    expect(summary.dietTags).toEqual(['Vegetarian']);
  });

  it('filters vegan via the canonical boolean', async () => {
    await service.searchFoods({ dietType: 'Vegan' } as FoodSearchDto);
    expect(prisma.food.findMany.mock.calls[0][0].where.isVegan).toBe(true);
  });

  it('excludes soft-deleted foods', async () => {
    await service.searchFoods({} as FoodSearchDto);
    expect(prisma.food.findMany.mock.calls[0][0].where.deletedAt).toBeNull();
  });

  it('searches by keyword case-insensitively', async () => {
    await service.searchFoods({ keyword: 'moong' } as FoodSearchDto);
    expect(prisma.food.findMany.mock.calls[0][0].where.name).toEqual({
      contains: 'moong',
      mode: 'insensitive',
    });
  });

  it('handles a food with no nutrition row without fabricating values', async () => {
    prisma.food.findFirst.mockResolvedValueOnce({
      ...food,
      nutrition: null,
      servings: [],
    });
    const detail = await service.getFoodDetail(F1);
    expect(detail.nutrition.micronutrients).toEqual([]);
    expect(detail.portion.description).toBe('');
  });

  it('404s for an unknown food', async () => {
    prisma.food.findFirst.mockResolvedValueOnce(null);
    await expect(service.getFoodDetail(F1)).rejects.toThrow(NotFoundException);
  });
});

describe('FoodSearchDto validation', () => {
  const check = (raw: unknown) => validate(plainToInstance(FoodSearchDto, raw));

  it('accepts documented params', async () => {
    expect(
      await check({ keyword: 'dal', category: 'Pulses', dietType: 'Vegan' }),
    ).toHaveLength(0);
  });

  it('rejects an unknown diet type', async () => {
    expect(await check({ dietType: 'Carnivore' })).not.toHaveLength(0);
  });
});
