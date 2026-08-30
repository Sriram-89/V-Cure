import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { HealthProfileService } from './health-profile.service';
import { HealthProfileRepository } from './health-profile.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('HealthProfileService', () => {
  let service: HealthProfileService;
  let prisma: any;

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
      userProfile: {
        findFirst: jest.fn().mockResolvedValue({
          dateOfBirth: new Date('1994-04-02'),
          gender: 'FEMALE',
        }),
      },
      healthProfile: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      bMIHistory: {
        create: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthProfileService,
        { provide: HealthProfileRepository, useValue: new HealthProfileRepository(prisma as any) },
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
      expect(result.bmiCategory).toBe('NORMAL');
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
      expect(result.bmiCategory).toBe('OVERWEIGHT');
    });

    it('appends a trend snapshot to history on every write', async () => {
      prisma.healthProfile.findFirst.mockResolvedValueOnce(existing);
      prisma.healthProfile.update.mockResolvedValueOnce(existing);

      await service.upsertMyHealthProfile('user_1', { weightKg: 70 });

      expect(prisma.bMIHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 'user_1' }),
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
      prisma.bMIHistory.findMany.mockResolvedValueOnce([
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
      expect(prisma.bMIHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user_1' },
          orderBy: { recordedAt: 'asc' },
        }),
      );
      expect(result[0].bmiCategory).toBe('NORMAL');
    });

    it('throws when no health profile exists', async () => {
      prisma.healthProfile.findFirst.mockResolvedValueOnce(null);
      await expect(service.getTrends('user_1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('goals (ACC1 GET/PATCH /goals)', () => {
    it('returns nulls when no health profile exists yet', async () => {
      prisma.healthProfile.findFirst.mockResolvedValueOnce(null);
      const result = await service.getMyGoals('user_1');
      expect(result).toEqual({
        primaryGoal: null,
        timeline: null,
        targetWeightKg: null,
      });
    });

    it('maps goalTimeline to the ACC1 `timeline` field name', async () => {
      prisma.healthProfile.findFirst.mockResolvedValueOnce({
        id: 'hp_1',
        userId: 'user_1',
        primaryGoal: 'WEIGHT_LOSS',
        goalTimeline: 'THREE_MONTHS',
        targetWeightKg: 72,
      });
      const result = await service.getMyGoals('user_1');
      expect(result).toEqual({
        primaryGoal: 'WEIGHT_LOSS',
        timeline: 'THREE_MONTHS',
        targetWeightKg: 72,
      });
    });

    it('throws NotFoundException when updating goals without a health profile', async () => {
      prisma.healthProfile.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.updateMyGoals('user_1', { primaryGoal: 'WEIGHT_GAIN' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('canonical ACC3 mapping', () => {
    it('derives age from UserProfile.dateOfBirth rather than storing it twice', async () => {
      prisma.healthProfile.findFirst.mockResolvedValueOnce(null);
      prisma.userProfile.findFirst.mockResolvedValueOnce({
        dateOfBirth: new Date('1994-04-02'),
        gender: 'FEMALE',
      });
      prisma.healthProfile.create.mockResolvedValueOnce({
        id: 'hp_new',
        bmi: 22,
        weightKg: 60,
        heightCm: 165,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await service.upsertMyHealthProfile('user_1', {
        heightCm: 165,
        weightKg: 60,
      } as any);
      const data = prisma.healthProfile.create.mock.calls[0][0].data;
      const dob = new Date('1994-04-02');
      const now = new Date();
      let expected = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) expected--;
      expect(data.age).toBe(expected);
      expect(data.gender).toBe('FEMALE');
    });

    it('refuses to create a health profile when no user profile supplies age/gender', async () => {
      prisma.healthProfile.findFirst.mockResolvedValueOnce(null);
      prisma.userProfile.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.upsertMyHealthProfile('user_1', {
          heightCm: 165,
          weightKg: 60,
        } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it.each(['WEIGHT_LOSS', 'WEIGHT_GAIN', 'GENERAL_WELLNESS'])(
      'maps deterministic goal %s onto canonical GoalType',
      async (goal) => {
        prisma.healthProfile.findFirst.mockResolvedValueOnce({ id: 'hp_1' });
        prisma.healthProfile.update.mockResolvedValueOnce({
          primaryGoal: goal,
          goalTimeline: null,
          targetWeightKg: null,
        });
        const result = await service.updateMyGoals('user_1', {
          primaryGoal: goal,
        } as any);
        expect(result.primaryGoal).toBe(goal);
      },
    );

    it.each(['MANAGE_CONDITION', 'IMPROVE_FITNESS'])(
      'rejects goal %s, which has no proven canonical equivalent (F-11)',
      async (goal) => {
        prisma.healthProfile.findFirst.mockResolvedValueOnce({ id: 'hp_1' });
        await expect(
          service.updateMyGoals('user_1', { primaryGoal: goal } as any),
        ).rejects.toThrow(UnprocessableEntityException);
        expect(prisma.healthProfile.update).not.toHaveBeenCalled();
      },
    );
  });
});
