import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LifestyleAssessmentService } from './lifestyle-assessment.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('LifestyleAssessmentService', () => {
  let service: LifestyleAssessmentService;
  let prisma: {
    lifestyleAssessment: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    lifestyleAssessmentHistory: { create: jest.Mock; findMany: jest.Mock };
  };

  const existing = {
    id: 'la_1',
    userId: 'user_1',
    workingHoursPerDay: 9,
    sleepHoursAvg: 7,
    sleepQuality: 'GOOD',
    stressLevel: 'MODERATE',
    waterIntakeLitersAvg: 2.5,
    smokingStatus: 'NEVER',
    alcoholStatus: 'NEVER',
    exerciseFrequencyPerWeek: 3,
    mealTimingNotes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      lifestyleAssessment: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      lifestyleAssessmentHistory: {
        create: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LifestyleAssessmentService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(LifestyleAssessmentService);
  });

  describe('getMyAssessment', () => {
    it('throws NotFoundException when none exists', async () => {
      prisma.lifestyleAssessment.findFirst.mockResolvedValueOnce(null);
      await expect(service.getMyAssessment('user_1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the assessment with derived risk flags', async () => {
      prisma.lifestyleAssessment.findFirst.mockResolvedValueOnce(existing);
      const result = await service.getMyAssessment('user_1');
      expect(result.riskFlags).toEqual([]);
    });
  });

  describe('upsertMyAssessment', () => {
    it('creates a new assessment defaulting smoking/alcohol to NEVER', async () => {
      prisma.lifestyleAssessment.findFirst.mockResolvedValueOnce(null);
      prisma.lifestyleAssessment.create.mockResolvedValueOnce(existing);

      await service.upsertMyAssessment('user_1', { sleepHoursAvg: 7 });

      expect(prisma.lifestyleAssessment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            smokingStatus: 'NEVER',
            alcoholStatus: 'NEVER',
          }),
        }),
      );
    });

    it('merges partial updates onto existing values', async () => {
      prisma.lifestyleAssessment.findFirst.mockResolvedValueOnce(existing);
      prisma.lifestyleAssessment.update.mockResolvedValueOnce({
        ...existing,
        stressLevel: 'HIGH',
      });

      await service.upsertMyAssessment('user_1', { stressLevel: 'HIGH' as any });

      expect(prisma.lifestyleAssessment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stressLevel: 'HIGH',
            sleepHoursAvg: existing.sleepHoursAvg, // preserved
          }),
        }),
      );
    });

    it('appends a trend snapshot to history on every write', async () => {
      prisma.lifestyleAssessment.findFirst.mockResolvedValueOnce(existing);
      prisma.lifestyleAssessment.update.mockResolvedValueOnce(existing);

      await service.upsertMyAssessment('user_1', { sleepHoursAvg: 7 });

      expect(prisma.lifestyleAssessmentHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lifestyleAssessmentId: existing.id,
          }),
        }),
      );
    });

    it('flags low sleep, high stress, low water intake, and sedentary lifestyle', async () => {
      const risky = {
        ...existing,
        sleepHoursAvg: 4,
        stressLevel: 'SEVERE',
        waterIntakeLitersAvg: 1,
        exerciseFrequencyPerWeek: 0,
        smokingStatus: 'CURRENT',
        alcoholStatus: 'REGULAR',
      };
      prisma.lifestyleAssessment.findFirst.mockResolvedValueOnce(risky);
      prisma.lifestyleAssessment.update.mockResolvedValueOnce(risky);

      const result = await service.upsertMyAssessment('user_1', {});

      expect(result.riskFlags).toEqual(
        expect.arrayContaining([
          'low_sleep',
          'elevated_stress',
          'low_water_intake',
          'sedentary',
          'current_smoker',
          'regular_alcohol_use',
        ]),
      );
    });
  });

  describe('getTrends', () => {
    it('returns chronological history points', async () => {
      prisma.lifestyleAssessment.findFirst.mockResolvedValueOnce(existing);
      prisma.lifestyleAssessmentHistory.findMany.mockResolvedValueOnce([
        { ...existing, recordedAt: new Date('2026-01-01') },
      ]);

      const result = await service.getTrends('user_1');
      expect(prisma.lifestyleAssessmentHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { lifestyleAssessmentId: existing.id },
          orderBy: { recordedAt: 'asc' },
        }),
      );
      expect(result).toHaveLength(1);
    });

    it('throws when no assessment exists', async () => {
      prisma.lifestyleAssessment.findFirst.mockResolvedValueOnce(null);
      await expect(service.getTrends('user_1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
