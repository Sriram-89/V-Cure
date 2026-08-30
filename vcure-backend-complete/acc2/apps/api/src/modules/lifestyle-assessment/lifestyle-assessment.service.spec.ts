import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LifestyleAssessmentService } from './lifestyle-assessment.service';
import { LifestyleAssessmentRepository } from './lifestyle-assessment.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('LifestyleAssessmentService', () => {
  let service: LifestyleAssessmentService;
  let prisma: any;

  const existing = {
    id: 'la_1',
    userId: 'user_1',
    workingHoursPerDay: 9,
    sleepHoursAvg: 7,
    sleepQuality: 'GOOD',
    stressLevel: 'MODERATE',
    waterIntakeLitersAvg: 2.5,
    smokingStatus: 'NEVER',
    alcoholStatus: 'NONE',
    exerciseFrequencyPerWeek: 3,
    mealTimingNotes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      lifestyle: {
        findFirst: jest.fn().mockResolvedValue(existing),
        create: jest.fn().mockResolvedValue(existing),
        update: jest.fn().mockResolvedValue(existing),
      },
      dailyLifestyle: {
        upsert: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LifestyleAssessmentService,
        { provide: LifestyleAssessmentRepository, useValue: new LifestyleAssessmentRepository(prisma as any) },
      ],
    }).compile();

    service = module.get(LifestyleAssessmentService);
  });

  describe('getMyAssessment', () => {
    it('throws NotFoundException when none exists', async () => {
      prisma.lifestyle.findFirst.mockResolvedValueOnce(null);
      await expect(service.getMyAssessment('user_1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the assessment with derived risk flags', async () => {
      prisma.lifestyle.findFirst.mockResolvedValueOnce(existing);
      const result = await service.getMyAssessment('user_1');
      expect(result.riskFlags).toEqual([]);
    });
  });

  describe('upsertMyAssessment', () => {
    it('creates a new assessment defaulting smoking/alcohol to NEVER', async () => {
      prisma.lifestyle.findFirst.mockResolvedValueOnce(null);
      prisma.lifestyle.create.mockResolvedValueOnce(existing);

      await service.upsertMyAssessment('user_1', { sleepHoursAvg: 7 });

      expect(prisma.lifestyle.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            smokingStatus: 'NEVER',
            alcoholStatus: 'NONE',
          }),
        }),
      );
    });

    it('merges partial updates onto existing values', async () => {
      prisma.lifestyle.findFirst.mockResolvedValueOnce(existing);
      prisma.lifestyle.update.mockResolvedValueOnce({
        ...existing,
        stressLevel: 'HIGH',
      });

      await service.upsertMyAssessment('user_1', { stressLevel: 'HIGH' as any });

      expect(prisma.lifestyle.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stressLevel: 'HIGH',
            sleepHoursAvg: existing.sleepHoursAvg, // preserved
          }),
        }),
      );
    });

    it('appends a trend snapshot to history on every write', async () => {
      prisma.lifestyle.findFirst.mockResolvedValueOnce(existing);
      prisma.lifestyle.update.mockResolvedValueOnce(existing);

      await service.upsertMyAssessment('user_1', { sleepHoursAvg: 7 });

      // Canonical DailyLifestyle: one row per user per UTC day, upserted.
      expect(prisma.dailyLifestyle.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId_date: expect.objectContaining({ userId: 'user_1' }),
          }),
          create: expect.objectContaining({ userId: 'user_1' }),
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
      prisma.lifestyle.findFirst.mockResolvedValueOnce(risky);
      prisma.lifestyle.update.mockResolvedValueOnce(risky);

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
      prisma.lifestyle.findFirst.mockResolvedValueOnce(existing);
      prisma.dailyLifestyle.findMany.mockResolvedValueOnce([
        { ...existing, recordedAt: new Date('2026-01-01') },
      ]);

      const result = await service.getTrends('user_1');
      expect(prisma.dailyLifestyle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user_1' },
          orderBy: { date: 'asc' },
        }),
      );
      expect(result).toHaveLength(1);
    });

    it('throws when no assessment exists', async () => {
      prisma.lifestyle.findFirst.mockResolvedValueOnce(null);
      await expect(service.getTrends('user_1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('risk-flag regression after canonical migration', () => {
    const build = (over: Record<string, unknown> = {}) => ({
      id: 'ls_1',
      userId: 'user_1',
      sleepHoursAvg: 8,
      stressLevel: 'LOW',
      waterIntakeLitersAvg: 3,
      exerciseFrequencyPerWeek: 4,
      smokingStatus: 'NEVER',
      alcoholStatus: 'NONE',
      dietType: null,
      deletedAt: null,
      ...over,
    });

    const flagsFor = async (over: Record<string, unknown>) => {
      prisma.lifestyle.findFirst.mockResolvedValueOnce(build(over));
      return service.getRiskFlags('user_1');
    };

    it('produces no flags for a healthy profile', async () => {
      expect(await flagsFor({})).toEqual([]);
    });

    it('flags low_sleep below 6 hours and not at 6', async () => {
      expect(await flagsFor({ sleepHoursAvg: 5.9 })).toContain('low_sleep');
      expect(await flagsFor({ sleepHoursAvg: 6 })).not.toContain('low_sleep');
    });

    it.each(['HIGH', 'SEVERE'])('flags elevated_stress for %s', async (lvl) => {
      expect(await flagsFor({ stressLevel: lvl })).toContain('elevated_stress');
    });

    it.each(['LOW', 'MODERATE'])('does not flag stress for %s', async (lvl) => {
      expect(await flagsFor({ stressLevel: lvl })).not.toContain('elevated_stress');
    });

    it('flags low_water_intake below 1.5 L and not at 1.5', async () => {
      expect(await flagsFor({ waterIntakeLitersAvg: 1.4 })).toContain('low_water_intake');
      expect(await flagsFor({ waterIntakeLitersAvg: 1.5 })).not.toContain('low_water_intake');
    });

    it('flags sedentary only at exactly zero sessions', async () => {
      expect(await flagsFor({ exerciseFrequencyPerWeek: 0 })).toContain('sedentary');
      expect(await flagsFor({ exerciseFrequencyPerWeek: 1 })).not.toContain('sedentary');
    });

    it('flags current_smoker only for CURRENT', async () => {
      expect(await flagsFor({ smokingStatus: 'CURRENT' })).toContain('current_smoker');
      expect(await flagsFor({ smokingStatus: 'FORMER' })).not.toContain('current_smoker');
    });

    it('flags regular_alcohol_use only for REGULAR, read from canonical alcoholStatus', async () => {
      expect(await flagsFor({ alcoholStatus: 'REGULAR' })).toContain('regular_alcohol_use');
      expect(await flagsFor({ alcoholStatus: 'FREQUENT' })).not.toContain('regular_alcohol_use');
    });

    it('ignores null values exactly as before', async () => {
      expect(
        await flagsFor({
          sleepHoursAvg: null,
          waterIntakeLitersAvg: null,
          exerciseFrequencyPerWeek: null,
        }),
      ).toEqual([]);
    });

    it('accumulates every flag together', async () => {
      const flags = await flagsFor({
        sleepHoursAvg: 4,
        stressLevel: 'SEVERE',
        waterIntakeLitersAvg: 1,
        exerciseFrequencyPerWeek: 0,
        smokingStatus: 'CURRENT',
        alcoholStatus: 'REGULAR',
      });
      expect(flags.sort()).toEqual(
        [
          'current_smoker',
          'elevated_stress',
          'low_sleep',
          'low_water_intake',
          'regular_alcohol_use',
          'sedentary',
        ].sort(),
      );
    });
  });
});
