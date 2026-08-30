import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProgressService } from './progress.service';
import { HealthProfileRepository } from '../health-profile/health-profile.repository';
import { HealthProfileService } from '../health-profile/health-profile.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ProgressRangeDto } from './dto/progress-range.dto';
import { LogWeightDto } from './dto/log-weight.dto';

describe('ProgressService', () => {
  let service: ProgressService;
  let prisma: any;
  let healthProfileService: { categorizeBmi: jest.Mock; upsertMyHealthProfile: jest.Mock };
  const userId = 'user_1';

  const rows = [
    { recordedAt: new Date('2026-01-01T00:00:00.000Z'), weightKg: 80, bmi: 29.4 },
    { recordedAt: new Date('2026-02-01T00:00:00.000Z'), weightKg: 76, bmi: 27.9 },
  ];

  beforeEach(async () => {
    prisma = { bMIHistory: { findMany: jest.fn().mockResolvedValue(rows) } };
    healthProfileService = {
      categorizeBmi: jest.fn().mockReturnValue('OVERWEIGHT'),
      upsertMyHealthProfile: jest.fn().mockResolvedValue({
        weightKg: 75,
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      }),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProgressService,
        {
          provide: HealthProfileRepository,
          useValue: new HealthProfileRepository(prisma as unknown as PrismaService),
        },
        { provide: HealthProfileService, useValue: healthProfileService },
      ],
    }).compile();
    service = moduleRef.get(ProgressService);
  });

  it('maps weight history to the ACC1 WeightEntry shape', async () => {
    expect(await service.getWeightHistory(userId, '30D')).toEqual([
      { date: '2026-01-01T00:00:00.000Z', weightKg: 80 },
      { date: '2026-02-01T00:00:00.000Z', weightKg: 76 },
    ]);
  });

  it('scopes history to the user and orders it ascending', async () => {
    await service.getWeightHistory(userId, '30D');
    const arg = prisma.bMIHistory.findMany.mock.calls[0][0];
    expect(arg.where.userId).toBe(userId);
    expect(arg.orderBy).toEqual({ recordedAt: 'asc' });
  });

  it.each([
    ['7D', 7],
    ['30D', 30],
    ['90D', 90],
    ['1Y', 365],
  ])('applies a %s cut-off of %i days', async (range, days) => {
    const before = Date.now();
    await service.getWeightHistory(userId, range as any);
    const since: Date = prisma.bMIHistory.findMany.mock.calls[0][0].where.recordedAt.gte;
    const elapsedDays = (before - since.getTime()) / 86_400_000;
    expect(Math.round(elapsedDays)).toBe(days);
  });

  it('reads stored BMI and delegates categorisation — never recomputes either', async () => {
    const result = await service.getBmiHistory(userId, '30D');
    expect(result[0]).toEqual({
      date: '2026-01-01T00:00:00.000Z',
      bmi: 29.4,
      category: 'OVERWEIGHT',
    });
    expect(healthProfileService.categorizeBmi).toHaveBeenCalledWith(29.4);
    expect(healthProfileService.categorizeBmi).toHaveBeenCalledTimes(2);
  });

  it('logs weight through HealthProfileService so BMI and history stay on one path', async () => {
    const result = await service.logWeightEntry(userId, { weightKg: 75 } as LogWeightDto);
    expect(healthProfileService.upsertMyHealthProfile).toHaveBeenCalledWith(userId, {
      weightKg: 75,
    });
    expect(result).toEqual({ date: '2026-03-01T00:00:00.000Z', weightKg: 75 });
  });

  it('returns an empty series when there is no history', async () => {
    prisma.bMIHistory.findMany.mockResolvedValueOnce([]);
    expect(await service.getWeightHistory(userId, '7D')).toEqual([]);
  });
});

describe('Progress DTO validation', () => {
  it('defaults the range to 30D', () => {
    expect(plainToInstance(ProgressRangeDto, {}).range).toBe('30D');
  });

  it.each(['7D', '30D', '90D', '1Y'])('accepts preset %s', async (range) => {
    expect(await validate(plainToInstance(ProgressRangeDto, { range }))).toHaveLength(0);
  });

  it('rejects an arbitrary range', async () => {
    const errors = await validate(plainToInstance(ProgressRangeDto, { range: '5D' }));
    expect(errors.some((e) => e.property === 'range')).toBe(true);
  });

  it('rejects an implausible weight', async () => {
    const errors = await validate(plainToInstance(LogWeightDto, { weightKg: 5 }));
    expect(errors.some((e) => e.property === 'weightKg')).toBe(true);
  });

  it('accepts a valid weight', async () => {
    expect(await validate(plainToInstance(LogWeightDto, { weightKg: 72.5 }))).toHaveLength(0);
  });
});
