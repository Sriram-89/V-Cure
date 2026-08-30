import { Test } from '@nestjs/testing';
import { UnprocessableEntityException } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { UsersRepository } from '../users/users.repository';
import { HealthProfileRepository } from '../health-profile/health-profile.repository';
import { LifestyleAssessmentRepository } from '../lifestyle-assessment/lifestyle-assessment.repository';
import { MedicalHistoryRepository } from '../medical-history/medical-history.repository';
import { AuthRepository } from '../auth/auth.repository';
import { HealthProfileService } from '../health-profile/health-profile.service';
import { LifestyleAssessmentService } from '../lifestyle-assessment/lifestyle-assessment.service';
import { OnboardingCompleteDto } from './dto/onboarding-complete.dto';

const basePayload = (): OnboardingCompleteDto =>
  ({
    personalInfo: { dateOfBirth: '1994-04-02', gender: 'FEMALE', phone: '9876543210' },
    healthProfile: { heightCm: 165, weightKg: 62, bloodGroup: 'O_POSITIVE' },
    medicalProfile: { conditions: ['Asthma'], allergies: ['Peanuts'], medications: [] },
    lifestyle: {
      activityLevel: 'MODERATELY_ACTIVE',
      sleepHours: 7,
      smokingStatus: 'NEVER',
      alcoholConsumption: 'NONE',
      dietType: 'VEGETARIAN',
    },
    goals: { primaryGoal: 'GENERAL_WELLNESS', timeline: 'THREE_MONTHS' },
  }) as OnboardingCompleteDto;

describe('OnboardingService', () => {
  let service: OnboardingService;
  let prisma: any;
  let tx: any;

  beforeEach(async () => {
    tx = {
      userProfile: { update: jest.fn() },
      healthProfile: { upsert: jest.fn() },
      lifestyle: { upsert: jest.fn() },
      medicalCondition: { create: jest.fn() },
      allergy: { create: jest.fn() },
      // Catalogue lookups run inside the same transaction.
      disease: { findFirst: jest.fn().mockResolvedValue({ id: 'dis_1' }) },
      allergyType: { findFirst: jest.fn().mockResolvedValue({ id: 'at_1' }) },
      user: { update: jest.fn() },
    };
    prisma = {
      userProfile: { findFirst: jest.fn().mockResolvedValue({ id: 'up_1' }) },
      disease: { findFirst: jest.fn().mockResolvedValue({ id: 'dis_1' }) },
      allergyType: { findFirst: jest.fn().mockResolvedValue({ id: 'at_1' }) },
      $transaction: jest.fn(async (fn: any) => fn(tx)),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        OnboardingService,
        { provide: UsersRepository, useValue: new UsersRepository(prisma as any) },
        {
          provide: HealthProfileRepository,
          useValue: new HealthProfileRepository(prisma as any),
        },
        {
          provide: LifestyleAssessmentRepository,
          useValue: new LifestyleAssessmentRepository(prisma as any),
        },
        {
          provide: MedicalHistoryRepository,
          useValue: new MedicalHistoryRepository(prisma as any),
        },
        { provide: AuthRepository, useValue: new AuthRepository(prisma as any) },
        {
          provide: HealthProfileService,
          useValue: new HealthProfileService(new HealthProfileRepository(prisma as any)),
        },
        {
          provide: LifestyleAssessmentService,
          useValue: { getRiskFlags: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    service = moduleRef.get(OnboardingService);
  });

  it('performs every write inside a single transaction', async () => {
    await service.complete('user_1', basePayload());
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.userProfile.update).toHaveBeenCalled();
    expect(tx.healthProfile.upsert).toHaveBeenCalled();
    expect(tx.lifestyle.upsert).toHaveBeenCalled();
    expect(tx.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { onboardingCompleted: true } }),
    );
  });

  it('creates one row per condition and allergy', async () => {
    await service.complete('user_1', basePayload());
    expect(tx.medicalCondition.create).toHaveBeenCalledTimes(1);
    expect(tx.allergy.create).toHaveBeenCalledTimes(1);
    // Canonical: allergens are catalogue references the Safety Engine reads.
    expect(tx.allergy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { userId: 'user_1', allergyTypeId: 'at_1', severity: 'MODERATE' },
      }),
    );
  });

  it('reuses HealthProfileService for BMI rather than recomputing it', async () => {
    const result = await service.complete('user_1', basePayload());
    // 62 / 1.65^2 = 22.77...
    expect(result.bmi).toBe(22.8);
    expect(result.onboardingCompleted).toBe(true);
  });

  it('rejects medications instead of inventing dosage/frequency (CONFLICT-2)', async () => {
    const payload = basePayload();
    payload.medicalProfile.medications = ['Metformin'];
    await expect(service.complete('user_1', payload)).rejects.toThrow(
      UnprocessableEntityException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects onboarding when no user profile exists, since fullName is absent (CONFLICT-1)', async () => {
    prisma.userProfile.findFirst.mockResolvedValueOnce(null);
    await expect(service.complete('user_1', basePayload())).rejects.toThrow(
      UnprocessableEntityException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
