import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { HealthProfileService } from './health-profile.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('HealthProfileService', () => {
  let service: HealthProfileService;
  let prisma: {
    healthProfile: { findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
    healthProfileHistory: { create: jest.Mock; findMany: jest.Mock };
  };

  const existing = {
    id: 'hp_1',
    userId: 'user_1',
    heightCm: 175,
    weightKg: 70,
    waistCm: 85,
    bmi: 22.9,
    occupation: 'Software Engineer',
    activityLevel: 'MODERATE',
    budgetPerDayINR: 400,
    healthGoals: ['weight_loss'],
    favoriteFoods: ['idli'],
    dislikedFoods: [],
    foodPreference: 'vegetarian',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      healthProfile: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      healthProfileHistory: {
        create: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthProfileService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(HealthProfileService);
  });

  describe('upsertMyHealthProfile', () => {
    it('computes BMI server-side on create, ignoring any client-sent bmi', async () => {
      prisma.healthProfile.findFirst.mockResolvedValueOnce(null);
      prisma.healthProfile.create.mockResolvedValueOnce({
        ...existing,
        bmi: 22.9,
      });

      const result = await service.upsertMyHealthProfile('user_1', {
        heightCm: 175,
        weightKg: 70,
      });

      expect(prisma.healthProfile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ bmi: 22.9 }),
        }),
      );
      expect(result.bmi).toBe(22.9);
      expect(result.bmiCategory).toBe('normal');
    });

    it('recomputes BMI on update when weight changes', async () => {
      prisma.healthProfile.findFirst.mockResolvedValueOnce(existing);
      prisma.healthProfile.update.mockResolvedValueOnce({
        ...existing,
        weightKg: 90,
        bmi: 29.4,
      });

      const result = await service.upsertMyHealthProfile('user_1', {
        weightKg: 90,
      });

      expect(prisma.healthProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ bmi: 29.4 }),
        }),
      );
      expect(result.bmiCategory).toBe('overweight');
    });

    it('appends a trend snapshot to history on every write', async () => {
      prisma.healthProfile.findFirst.mockResolvedValueOnce(existing);
      prisma.healthProfile.update.mockResolvedValueOnce(existing);

      await service.upsertMyHealthProfile('user_1', { weightKg: 70 });

      expect(prisma.healthProfileHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ healthProfileId: existing.id }),
        }),
      );
    });

    it('throws when creating without height/weight', async () => {
      prisma.healthProfile.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.upsertMyHealthProfile('user_1', { occupation: 'Chef' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTrends', () => {
    it('returns chronological trend points with BMI category', async () => {
      prisma.healthProfile.findFirst.mockResolvedValueOnce(existing);
      prisma.healthProfileHistory.findMany.mockResolvedValueOnce([
        {
          id: 'h1',
          heightCm: 175,
          weightKg: 72,
          waistCm: 86,
          bmi: 23.5,
          recordedAt: new Date('2026-01-01'),
        },
      ]);

      const result = await service.getTrends('user_1');
      expect(prisma.healthProfileHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { healthProfileId: existing.id },
          orderBy: { recordedAt: 'asc' },
        }),
      );
      expect(result[0].bmiCategory).toBe('normal');
    });

    it('throws when no health profile exists', async () => {
      prisma.healthProfile.findFirst.mockResolvedValueOnce(null);
      await expect(service.getTrends('user_1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
