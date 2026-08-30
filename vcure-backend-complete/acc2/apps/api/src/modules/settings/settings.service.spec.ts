import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SettingsService } from './settings.service';
import { SettingsRepository } from './settings.repository';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UpdateLanguageSettingsDto,
  UpdateNotificationPreferencesDto,
  UpdatePrivacyConsentDto,
  UpdateUnitsPreferenceDto,
} from './dto/update-settings.dto';

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: any;
  const userId = 'user_1';

  beforeEach(async () => {
    prisma = {
      userProfile: {
        findFirst: jest.fn().mockResolvedValue({ id: 'up_1', language: 'en' }),
        update: jest.fn().mockResolvedValue({ id: 'up_1', language: 'hi' }),
      },
      userSettings: {
        findFirst: jest.fn().mockResolvedValue(null),
        upsert: jest.fn(),
      },
      notificationPreference: {
        findFirst: jest.fn().mockResolvedValue(null),
        upsert: jest.fn(),
      },
      refreshToken: {
        findFirst: jest.fn().mockResolvedValue({ id: 'rt_1', userId }),
        update: jest.fn().mockResolvedValue({ id: 'rt_1', isRevoked: true }),
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: SettingsRepository,
          useValue: new SettingsRepository(prisma as unknown as PrismaService),
        },
      ],
    }).compile();
    service = moduleRef.get(SettingsService);
  });

  describe('language (owned by UserProfile.language)', () => {
    it('reads language from the user profile', async () => {
      expect(await service.getLanguageSettings(userId)).toEqual({
        languageCode: 'en',
      });
    });

    it('falls back to "en" when no profile exists yet', async () => {
      prisma.userProfile.findFirst.mockResolvedValueOnce(null);
      expect(await service.getLanguageSettings(userId)).toEqual({
        languageCode: 'en',
      });
    });

    it('persists a language change to the profile, not a duplicate table', async () => {
      const result = await service.updateLanguageSettings(userId, {
        languageCode: 'hi',
      } as UpdateLanguageSettingsDto);
      expect(prisma.userProfile.update).toHaveBeenCalledWith({
        where: { id: 'up_1' },
        data: { language: 'hi' },
      });
      expect(result).toEqual({ languageCode: 'hi' });
    });

    it('404s when updating language without a profile', async () => {
      prisma.userProfile.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.updateLanguageSettings(userId, {
          languageCode: 'te',
        } as UpdateLanguageSettingsDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('units', () => {
    it('returns schema defaults before anything is saved', async () => {
      expect(await service.getUnitsPreference(userId)).toEqual({
        heightUnit: 'cm',
        weightUnit: 'kg',
      });
    });

    it('returns persisted values once saved', async () => {
      prisma.userSettings.findFirst.mockResolvedValueOnce({
        heightUnit: 'ft_in',
        weightUnit: 'lb',
      });
      expect(await service.getUnitsPreference(userId)).toEqual({
        heightUnit: 'ft_in',
        weightUnit: 'lb',
      });
    });

    it('upserts so the row is created lazily on first save', async () => {
      prisma.userSettings.upsert.mockResolvedValueOnce({
        heightUnit: 'ft_in',
        weightUnit: 'lb',
      });
      const result = await service.updateUnitsPreference(userId, {
        heightUnit: 'ft_in',
        weightUnit: 'lb',
      } as UpdateUnitsPreferenceDto);
      const arg = prisma.userSettings.upsert.mock.calls[0][0];
      expect(arg.where).toEqual({ userId });
      expect(arg.create.userId).toBe(userId);
      expect(result).toEqual({ heightUnit: 'ft_in', weightUnit: 'lb' });
    });

    it('does not touch privacy consent when only units change', async () => {
      prisma.userSettings.upsert.mockResolvedValueOnce({
        heightUnit: 'cm',
        weightUnit: 'kg',
      });
      await service.updateUnitsPreference(userId, {
        heightUnit: 'cm',
        weightUnit: 'kg',
      } as UpdateUnitsPreferenceDto);
      expect(
        prisma.userSettings.upsert.mock.calls[0][0].update,
      ).not.toHaveProperty('dataSharingConsent');
    });
  });

  describe('privacy consent', () => {
    it('defaults to false — consent is never assumed', async () => {
      expect(await service.getPrivacyConsent(userId)).toEqual({
        shareDataForResearch: false,
      });
    });

    it('persists consent and writes only that field', async () => {
      prisma.userSettings.upsert.mockResolvedValueOnce({
        dataSharingConsent: true,
      });
      const result = await service.updatePrivacyConsent(userId, {
        shareDataForResearch: true,
      } as UpdatePrivacyConsentDto);
      // ACC3 canonical column name.
      expect(
        prisma.userSettings.upsert.mock.calls[0][0].update,
      ).toEqual({ dataSharingConsent: true });
      expect(result).toEqual({ shareDataForResearch: true });
    });
  });

  describe('notification preferences', () => {
    const all = {
      mealReminder: false,
      waterReminder: true,
      exerciseReminder: false,
      medicineReminder: true,
      sleepReminder: false,
      healthTips: true,
    };

    it('returns all six categories defaulted on before anything is saved', async () => {
      expect(await service.getNotificationPreferences(userId)).toEqual({
        mealReminder: true,
        waterReminder: true,
        exerciseReminder: true,
        medicineReminder: true,
        sleepReminder: true,
        healthTips: true,
      });
    });

    it('persists all six categories exactly as sent', async () => {
      // ACC3 stores reminder flags in the plural; ACC1 contract stays singular.
      prisma.notificationPreference.upsert.mockResolvedValueOnce({
        mealReminders: false, waterReminders: true, exerciseReminders: false,
        medicineReminders: true, sleepReminders: false, healthTips: true,
      });
      const result = await service.updateNotificationPreferences(
        userId,
        all as UpdateNotificationPreferencesDto,
      );
      expect(
        prisma.notificationPreference.upsert.mock.calls[0][0].update,
      ).toEqual({
        mealReminders: false, waterReminders: true, exerciseReminders: false,
        medicineReminders: true, sleepReminders: false, healthTips: true,
      });
      expect(result).toEqual(all);
    });
  });

  describe('session logout', () => {
    it('revokes a session the caller owns', async () => {
      await service.logoutSession(userId, 'rt_1');
      expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith({
        where: { id: 'rt_1', userId, revokedAt: null },
      });
      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'rt_1' },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it("404s rather than revoking another user's session", async () => {
      prisma.refreshToken.findFirst.mockResolvedValueOnce(null);
      await expect(service.logoutSession(userId, 'rt_other')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.refreshToken.update).not.toHaveBeenCalled();
    });
  });
});

describe('Settings DTO validation', () => {
  const check = (cls: any, raw: unknown) => validate(plainToInstance(cls, raw));

  it.each(['en', 'hi', 'te'])('accepts selectable language %s', async (code) => {
    expect(await check(UpdateLanguageSettingsDto, { languageCode: code })).toHaveLength(0);
  });

  it.each(['ta', 'kn', 'ml', 'mr'])(
    'rejects future language %s, which is documented but not selectable',
    async (code) => {
      expect(
        await check(UpdateLanguageSettingsDto, { languageCode: code }),
      ).not.toHaveLength(0);
    },
  );

  it('rejects an unknown height unit', async () => {
    const errors = await check(UpdateUnitsPreferenceDto, {
      heightUnit: 'metres',
      weightUnit: 'kg',
    });
    expect(errors.some((e) => e.property === 'heightUnit')).toBe(true);
  });

  it('accepts the documented unit values', async () => {
    expect(
      await check(UpdateUnitsPreferenceDto, { heightUnit: 'ft_in', weightUnit: 'lb' }),
    ).toHaveLength(0);
  });

  it('requires every notification category', async () => {
    const errors = await check(UpdateNotificationPreferencesDto, {
      mealReminder: true,
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects a non-boolean consent value', async () => {
    const errors = await check(UpdatePrivacyConsentDto, {
      shareDataForResearch: 'yes',
    });
    expect(errors.some((e) => e.property === 'shareDataForResearch')).toBe(true);
  });
});
