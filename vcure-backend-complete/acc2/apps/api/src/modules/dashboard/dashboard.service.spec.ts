import { Test } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { UsersRepository } from '../users/users.repository';
import { HealthProfileRepository } from '../health-profile/health-profile.repository';
import { HealthProfileService } from '../health-profile/health-profile.service';
import { LifestyleAssessmentService } from '../lifestyle-assessment/lifestyle-assessment.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: any;
  let lifestyle: { getRiskFlags: jest.Mock };

  beforeEach(async () => {
    prisma = {
      userProfile: { findFirst: jest.fn().mockResolvedValue({ fullName: 'Asha R' }) },
      healthProfile: { findFirst: jest.fn().mockResolvedValue({ bmi: 27.3 }) },
      bMIHistory: {
        findMany: jest.fn().mockResolvedValue([
          { recordedAt: new Date('2026-01-01T00:00:00.000Z'), weightKg: 80 },
          { recordedAt: new Date('2026-02-01T00:00:00.000Z'), weightKg: 78.5 },
        ]),
      },
    };
    lifestyle = { getRiskFlags: jest.fn().mockResolvedValue(['low_sleep']) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: UsersRepository, useValue: new UsersRepository(prisma as any) },
        {
          provide: HealthProfileRepository,
          useValue: new HealthProfileRepository(prisma as any),
        },
        {
          provide: HealthProfileService,
          useValue: new HealthProfileService(new HealthProfileRepository(prisma as any)),
        },
        { provide: LifestyleAssessmentService, useValue: lifestyle },
      ],
    }).compile();

    service = moduleRef.get(DashboardService);
  });

  it('maps persisted data to the ACC1 DashboardSummaryDto shape', async () => {
    const result = await service.getSummary('user_1');
    expect(result.fullName).toBe('Asha R');
    expect(result.bmi).toBe(27.3);
    expect(result.bmiCategory).toBe('OVERWEIGHT'); // uppercase per D-4
    expect(result.activeRiskFlags).toEqual(['low_sleep']);
    expect(result.weightTrend).toEqual([
      { date: '2026-01-01T00:00:00.000Z', weightKg: 80 },
      { date: '2026-02-01T00:00:00.000Z', weightKg: 78.5 },
    ]);
  });

  it('returns empty representations for modules that do not exist, never fabricated data', async () => {
    const result = await service.getSummary('user_1');
    expect(result.todayMeals).toEqual([]);
    expect(result.streakDays).toBe(0);
  });

  it('returns null bmi and null category when no health profile exists', async () => {
    prisma.healthProfile.findFirst.mockResolvedValueOnce(null);
    const result = await service.getSummary('user_1');
    expect(result.bmi).toBeNull();
    expect(result.bmiCategory).toBeNull();
  });
});
