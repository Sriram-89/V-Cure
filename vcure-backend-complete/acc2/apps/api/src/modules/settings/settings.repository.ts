import { Injectable } from '@nestjs/common';
import {
  NotificationPreference,
  Prisma,
  RefreshToken,
  UserProfile,
  UserSettings,
} from '@prisma/client';
import { BaseRepository } from '../../database/base.repository';
import { PrismaTx } from '../../database/prisma-tx.type';

/** Persistence for the Settings surface (User Domain, 03 §34). */
@Injectable()
export class SettingsRepository extends BaseRepository {
  // --- Language: owned by UserProfile.language (RULE-064, single owner) ---
  findProfile(userId: string, tx?: PrismaTx): Promise<UserProfile | null> {
    return this.db(tx).userProfile.findFirst({
      where: { userId, deletedAt: null },
    });
  }

  updateProfileLanguage(
    profileId: string,
    language: string,
    tx?: PrismaTx,
  ): Promise<UserProfile> {
    return this.db(tx).userProfile.update({
      where: { id: profileId },
      data: { language },
    });
  }

  // --- UserSettings ---
  findSettings(userId: string, tx?: PrismaTx): Promise<UserSettings | null> {
    return this.db(tx).userSettings.findFirst({
      where: { userId, deletedAt: null },
    });
  }

  upsertSettings(
    userId: string,
    data: Prisma.UserSettingsUncheckedUpdateInput,
    tx?: PrismaTx,
  ): Promise<UserSettings> {
    return this.db(tx).userSettings.upsert({
      where: { userId },
      create: { userId, ...(data as object) },
      update: data,
    });
  }

  // --- NotificationPreference ---
  findNotificationPreference(
    userId: string,
    tx?: PrismaTx,
  ): Promise<NotificationPreference | null> {
    return this.db(tx).notificationPreference.findFirst({
      where: { userId, deletedAt: null },
    });
  }

  upsertNotificationPreference(
    userId: string,
    data: Prisma.NotificationPreferenceUncheckedUpdateInput,
    tx?: PrismaTx,
  ): Promise<NotificationPreference> {
    return this.db(tx).notificationPreference.upsert({
      where: { userId },
      create: { userId, ...(data as object) },
      update: data,
    });
  }

  // --- Sessions: reuses the existing RefreshToken model ---
  findOwnedActiveSession(
    id: string,
    userId: string,
    tx?: PrismaTx,
  ): Promise<RefreshToken | null> {
    return this.db(tx).refreshToken.findFirst({
      where: { id, userId, revokedAt: null },
    });
  }

  revokeSession(id: string, tx?: PrismaTx): Promise<RefreshToken> {
    return this.db(tx).refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}
