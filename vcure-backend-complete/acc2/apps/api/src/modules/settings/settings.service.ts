import { Injectable, NotFoundException } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import {
  UpdateLanguageSettingsDto,
  UpdateNotificationPreferencesDto,
  UpdatePrivacyConsentDto,
  UpdateUnitsPreferenceDto,
} from './dto/update-settings.dto';
import {
  LanguageSettingsResponse,
  NotificationPreferencesResponse,
  PrivacyConsentResponse,
  UnitsPreferenceResponse,
} from './types/settings.type';

@Injectable()
export class SettingsService {
  constructor(private readonly repository: SettingsRepository) {}

  // ---------------------------------------------------------------- language
  /** Language is read from UserProfile.language, its single owner. */
  async getLanguageSettings(userId: string): Promise<LanguageSettingsResponse> {
    const profile = await this.repository.findProfile(userId);
    return { languageCode: profile?.language ?? 'en' };
  }

  async updateLanguageSettings(
    userId: string,
    dto: UpdateLanguageSettingsDto,
  ): Promise<LanguageSettingsResponse> {
    const profile = await this.repository.findProfile(userId);
    if (!profile) {
      throw new NotFoundException(
        'User profile not found. Complete onboarding before changing language.',
      );
    }
    const updated = await this.repository.updateProfileLanguage(
      profile.id,
      dto.languageCode,
    );
    return { languageCode: updated.language };
  }

  // ------------------------------------------------------------------- units
  /**
   * Settings rows are created lazily. Before the user has saved anything the
   * schema defaults are returned rather than a 404, so ACC1 can render the
   * form on a fresh account.
   */
  async getUnitsPreference(userId: string): Promise<UnitsPreferenceResponse> {
    const settings = await this.repository.findSettings(userId);
    return {
      heightUnit: settings?.heightUnit ?? 'cm',
      weightUnit: settings?.weightUnit ?? 'kg',
    };
  }

  async updateUnitsPreference(
    userId: string,
    dto: UpdateUnitsPreferenceDto,
  ): Promise<UnitsPreferenceResponse> {
    const saved = (await this.repository.upsertSettings(userId, {
      measurementSystem: dto.heightUnit === 'INCHES' || dto.weightUnit === 'LBS' ? 'imperial' : 'metric',
    } as any)) as any;
    return { heightUnit: dto.heightUnit, weightUnit: dto.weightUnit };
  }

  // ----------------------------------------------------------------- privacy
  async getPrivacyConsent(userId: string): Promise<PrivacyConsentResponse> {
    const settings = await this.repository.findSettings(userId);
    return { shareDataForResearch: settings?.dataSharingConsent ?? false };
  }

  async updatePrivacyConsent(
    userId: string,
    dto: UpdatePrivacyConsentDto,
  ): Promise<PrivacyConsentResponse> {
    // ACC3 canonical column for ACC1's shareDataForResearch.
    const saved = await this.repository.upsertSettings(userId, {
      dataSharingConsent: dto.shareDataForResearch,
    });
    return { shareDataForResearch: saved.dataSharingConsent };
  }

  // ----------------------------------------------------------- notifications
  async getNotificationPreferences(
    userId: string,
  ): Promise<NotificationPreferencesResponse> {
    const prefs = (await this.repository.findNotificationPreference(userId)) as any;
    // ACC3 canonicalises reminder flags in the plural; ACC1 uses the singular.
    return {
      mealReminder: prefs?.mealReminders ?? true,
      waterReminder: prefs?.waterReminders ?? true,
      exerciseReminder: prefs?.exerciseReminders ?? true,
      medicineReminder: prefs?.medicineReminders ?? true,
      sleepReminder: prefs?.sleepReminders ?? true,
      healthTips: prefs?.healthTips ?? true,
    };
  }

  async updateNotificationPreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesResponse> {
    const saved = (await this.repository.upsertNotificationPreference(userId, {
      mealReminders: dto.mealReminder,
      waterReminders: dto.waterReminder,
      exerciseReminders: dto.exerciseReminder,
      medicineReminders: dto.medicineReminder,
    } as any)) as any;
    return {
      mealReminder: saved.mealReminders ?? true,
      waterReminder: saved.waterReminders ?? true,
      exerciseReminder: saved.exerciseReminders ?? true,
      medicineReminder: saved.medicineReminders ?? true,
      sleepReminder: saved.sleepReminders ?? true,
      healthTips: saved.healthTips ?? true,
    };
  }

  // --------------------------------------------------------------- sessions
  /**
   * Revokes one session the caller owns. Reuses the existing RefreshToken
   * model rather than duplicating session logic; ownership is enforced by
   * scoping the lookup to the caller's userId.
   */
  async logoutSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.repository.findOwnedActiveSession(
      sessionId,
      userId,
    );
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    await this.repository.revokeSession(session.id);
  }
}
