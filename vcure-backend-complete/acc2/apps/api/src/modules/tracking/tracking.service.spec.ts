import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TrackingService } from './tracking.service';
import { TrackingRepository } from './tracking.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { LogWaterDto, WaterHistoryQueryDto } from './dto/water.dto';
import { LogSleepDto } from './dto/sleep.dto';
import { LogExerciseDto } from './dto/exercise.dto';

describe('TrackingService — water (Bible APIs 44/45)', () => {
  let service: TrackingService;
  let prisma: any;
  const userId = 'user_1';

  beforeEach(async () => {
    prisma = {
      sleepTracking: {
        create: jest.fn().mockImplementation(({ data }: any) =>
          Promise.resolve({ id: 's1', loggedAt: new Date('2026-03-02T06:00:00.000Z'), ...data }),
        ),
      },
      exerciseTracking: {
        create: jest.fn().mockImplementation(({ data }: any) =>
          Promise.resolve({ id: 'e1', loggedAt: new Date('2026-03-02T18:00:00.000Z'), ...data }),
        ),
      },
      waterTracking: {
        create: jest.fn().mockResolvedValue({ id: 'w1' }),
        findMany: jest.fn().mockResolvedValue([
          { id: 'w1', amountMl: 250, loggedAt: new Date('2026-03-01T08:00:00.000Z') },
          { id: 'w2', amountMl: 300, loggedAt: new Date('2026-03-01T12:00:00.000Z') },
        ]),
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        TrackingService,
        {
          provide: TrackingRepository,
          useValue: new TrackingRepository(prisma as unknown as PrismaService),
        },
      ],
    }).compile();
    service = moduleRef.get(TrackingService);
  });

  it('persists the entry and returns the running daily total', async () => {
    const result = await service.logWater(userId, {
      amountMl: 250,
      loggedAt: '2026-03-01T08:00:00.000Z',
    } as LogWaterDto);
    expect(prisma.waterTracking.create).toHaveBeenCalledWith({
      data: { userId, amountMl: 250, loggedAt: new Date('2026-03-01T08:00:00.000Z') },
    });
    expect(result.waterLoggedMl).toBe(550);
  });

  it('never returns a target or adherence figure — no formula exists', async () => {
    const result = await service.logWater(userId, { amountMl: 250 } as LogWaterDto);
    expect(Object.keys(result).sort()).toEqual(['date', 'waterLoggedMl']);
  });

  it('bounds the daily total to a UTC day', async () => {
    await service.logWater(userId, {
      amountMl: 200,
      loggedAt: '2026-03-01T23:30:00.000Z',
    } as LogWaterDto);
    const where = prisma.waterTracking.findMany.mock.calls[0][0].where;
    expect(where.loggedAt.gte.toISOString()).toBe('2026-03-01T00:00:00.000Z');
    expect(where.loggedAt.lte.toISOString()).toBe('2026-03-01T23:59:59.999Z');
  });

  it('defaults loggedAt to now when the client omits it', async () => {
    const before = Date.now();
    await service.logWater(userId, { amountMl: 100 } as LogWaterDto);
    const used: Date = prisma.waterTracking.create.mock.calls[0][0].data.loggedAt;
    expect(used.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('returns history newest-first and excludes soft-deleted rows', async () => {
    const result = await service.getWaterHistory(userId, {} as WaterHistoryQueryDto);
    const arg = prisma.waterTracking.findMany.mock.calls[0][0];
    expect(arg.orderBy).toEqual({ loggedAt: 'desc' });
    // ACC3 tracking rows are append-only — no deletedAt column exists.
    expect(arg.where).not.toHaveProperty('deletedAt');
    expect(result).toHaveLength(2);
  });

  it('applies from/to bounds only when supplied', async () => {
    await service.getWaterHistory(userId, {} as WaterHistoryQueryDto);
    expect(prisma.waterTracking.findMany.mock.calls[0][0].where.loggedAt).toBeUndefined();

    await service.getWaterHistory(userId, {
      from: '2026-03-01T00:00:00.000Z',
    } as WaterHistoryQueryDto);
    expect(
      prisma.waterTracking.findMany.mock.calls[1][0].where.loggedAt.gte,
    ).toBeInstanceOf(Date);
  });

  it('scopes every query to the calling user', async () => {
    await service.getWaterHistory(userId, {} as WaterHistoryQueryDto);
    expect(prisma.waterTracking.findMany.mock.calls[0][0].where.userId).toBe(userId);
  });
});

describe('Water DTO validation', () => {
  const check = (cls: any, raw: unknown) => validate(plainToInstance(cls, raw));

  it('accepts a plausible volume', async () => {
    expect(await check(LogWaterDto, { amountMl: 250 })).toHaveLength(0);
  });

  it.each([0, 6000])('rejects an implausible volume %i', async (amountMl) => {
    expect(await check(LogWaterDto, { amountMl })).not.toHaveLength(0);
  });

  it('rejects a non-integer volume', async () => {
    expect(await check(LogWaterDto, { amountMl: 12.5 })).not.toHaveLength(0);
  });

  it('rejects a malformed timestamp', async () => {
    expect(await check(LogWaterDto, { amountMl: 250, loggedAt: 'yesterday' })).not.toHaveLength(0);
  });
});

describe('TrackingService — sleep (Bible API 46)', () => {
  let service: TrackingService;
  let prisma: any;
  const userId = 'user_1';

  beforeEach(async () => {
    prisma = {
      sleepTracking: {
        create: jest.fn().mockImplementation(({ data }: any) =>
          Promise.resolve({ id: 's1', loggedAt: new Date('2026-03-02T06:00:00.000Z'), ...data }),
        ),
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        TrackingService,
        {
          provide: TrackingRepository,
          useValue: new TrackingRepository(prisma as unknown as PrismaService),
        },
      ],
    }).compile();
    service = moduleRef.get(TrackingService);
  });

  it('persists exactly the four documented fields, scoped to the user', async () => {
    await service.logSleep(userId, {
      hours: 7.5,
      quality: 'GOOD',
      bedTime: '2026-03-01T23:00:00.000Z',
      wakeTime: '2026-03-02T06:30:00.000Z',
    } as LogSleepDto);
    expect(prisma.sleepTracking.create).toHaveBeenCalledWith({
      data: {
        userId,
        hours: 7.5,
        quality: 'GOOD',
        bedTime: new Date('2026-03-01T23:00:00.000Z'),
        wakeTime: new Date('2026-03-02T06:30:00.000Z'),
      },
    });
  });

  it('nulls optional bed/wake times rather than inventing them', async () => {
    await service.logSleep(userId, { hours: 6, quality: 'FAIR' } as LogSleepDto);
    const data = prisma.sleepTracking.create.mock.calls[0][0].data;
    expect(data.bedTime).toBeNull();
    expect(data.wakeTime).toBeNull();
  });

  it('derives no sleep score, target or debt', async () => {
    const result = await service.logSleep(userId, {
      hours: 7,
      quality: 'GOOD',
    } as LogSleepDto);
    expect(Object.keys(result).sort()).toEqual(
      ['bedTime', 'hours', 'id', 'loggedAt', 'quality', 'wakeTime'],
    );
  });
});

describe('TrackingService — exercise (Bible API 47)', () => {
  let service: TrackingService;
  let prisma: any;
  const userId = 'user_1';

  beforeEach(async () => {
    prisma = {
      exerciseTracking: {
        create: jest.fn().mockImplementation(({ data }: any) =>
          Promise.resolve({ id: 'e1', loggedAt: new Date('2026-03-02T18:00:00.000Z'), ...data }),
        ),
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        TrackingService,
        {
          provide: TrackingRepository,
          useValue: new TrackingRepository(prisma as unknown as PrismaService),
        },
      ],
    }).compile();
    service = moduleRef.get(TrackingService);
  });

  it('stores caloriesBurned exactly as supplied — never computed', async () => {
    const result = await service.logExercise(userId, {
      exerciseType: 'Cycling',
      durationMinutes: 45,
      caloriesBurned: 380,
    } as LogExerciseDto);
    expect(prisma.exerciseTracking.create.mock.calls[0][0].data).toEqual({
      userId,
      activityType: 'Cycling',
      durationMinutes: 45,
      caloriesBurned: 380,
    });
    expect(result.caloriesBurned).toBe(380);
  });

  it('stores null when the client omits caloriesBurned — no burn formula is applied', async () => {
    const result = await service.logExercise(userId, {
      exerciseType: 'Yoga',
      durationMinutes: 30,
    } as LogExerciseDto);
    expect(prisma.exerciseTracking.create.mock.calls[0][0].data.caloriesBurned).toBeNull();
    expect(result.caloriesBurned).toBeNull();
  });

  it('accepts any exercise type — no closed set is imposed', async () => {
    await service.logExercise(userId, {
      exerciseType: 'Kalaripayattu',
      durationMinutes: 60,
    } as LogExerciseDto);
    // ACC3 canonical column is `activityType`; ACC1 sends `exerciseType`.
    expect(prisma.exerciseTracking.create.mock.calls[0][0].data.activityType).toBe(
      'Kalaripayattu',
    );
  });

  it('scopes the write to the calling user', async () => {
    await service.logExercise(userId, {
      exerciseType: 'Walking',
      durationMinutes: 20,
    } as LogExerciseDto);
    expect(prisma.exerciseTracking.create.mock.calls[0][0].data.userId).toBe(userId);
  });
});

describe('Sleep and Exercise DTO validation', () => {
  const check = (cls: any, raw: unknown) => validate(plainToInstance(cls, raw));

  it('accepts a valid sleep entry', async () => {
    expect(await check(LogSleepDto, { hours: 7.5, quality: 'GOOD' })).toHaveLength(0);
  });

  it.each([-1, 25])('rejects implausible sleep hours %i', async (hours) => {
    expect(await check(LogSleepDto, { hours, quality: 'GOOD' })).not.toHaveLength(0);
  });

  it('rejects an unknown sleep quality', async () => {
    expect(await check(LogSleepDto, { hours: 7, quality: 'AMAZING' })).not.toHaveLength(0);
  });

  it('rejects a malformed bed time', async () => {
    expect(
      await check(LogSleepDto, { hours: 7, quality: 'GOOD', bedTime: 'last night' }),
    ).not.toHaveLength(0);
  });

  it('accepts a valid exercise entry', async () => {
    expect(
      await check(LogExerciseDto, { exerciseType: 'Running', durationMinutes: 30 }),
    ).toHaveLength(0);
  });

  it.each([0, 2000])('rejects implausible duration %i', async (durationMinutes) => {
    expect(
      await check(LogExerciseDto, { exerciseType: 'Running', durationMinutes }),
    ).not.toHaveLength(0);
  });

  it('rejects a missing exercise type', async () => {
    expect(await check(LogExerciseDto, { durationMinutes: 30 })).not.toHaveLength(0);
  });

  it('rejects negative calories burned', async () => {
    expect(
      await check(LogExerciseDto, {
        exerciseType: 'Gym',
        durationMinutes: 30,
        caloriesBurned: -5,
      }),
    ).not.toHaveLength(0);
  });
});
