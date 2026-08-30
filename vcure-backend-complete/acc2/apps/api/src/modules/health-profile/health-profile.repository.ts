import { Injectable } from '@nestjs/common';
import { Gender, HealthProfile, Prisma } from '@prisma/client';
import { BaseRepository } from '../../database/base.repository';
import { PrismaTx } from '../../database/prisma-tx.type';

/** Persistence for the Health domain (HealthProfile + its history). */
@Injectable()
export class HealthProfileRepository extends BaseRepository {
  findActive(userId: string, tx?: PrismaTx): Promise<HealthProfile | null> {
    return this.db(tx).healthProfile.findFirst({
      where: { userId, deletedAt: null },
    });
  }

  create(
    data: Prisma.HealthProfileUncheckedCreateInput,
    tx?: PrismaTx,
  ): Promise<HealthProfile> {
    return this.db(tx).healthProfile.create({ data });
  }

  update(
    id: string,
    data: Prisma.HealthProfileUncheckedUpdateInput,
    tx?: PrismaTx,
  ): Promise<HealthProfile> {
    return this.db(tx).healthProfile.update({ where: { id }, data });
  }

  upsertByUserId(
    userId: string,
    create: Prisma.HealthProfileUncheckedCreateInput,
    update: Prisma.HealthProfileUncheckedUpdateInput,
    tx?: PrismaTx,
  ): Promise<HealthProfile> {
    return this.db(tx).healthProfile.upsert({
      where: { userId },
      create,
      update,
    });
  }

  /** Canonical BMIHistory (ACC3) — append-only. */
  createHistory(
    data: Prisma.BMIHistoryUncheckedCreateInput,
    tx?: PrismaTx,
  ): Promise<unknown> {
    return this.db(tx).bMIHistory.create({ data });
  }

  /** Source of the derived age/gender required by canonical HealthProfile. */
  findUserProfile(
    userId: string,
    tx?: PrismaTx,
  ): Promise<{ dateOfBirth: Date; gender: Gender } | null> {
    return this.db(tx).userProfile.findFirst({
      where: { userId, deletedAt: null },
      select: { dateOfBirth: true, gender: true },
    });
  }

  findHistory(
    userId: string,
    order: 'asc' | 'desc' = 'asc',
    tx?: PrismaTx,
  ): Promise<any[]> {
    return this.db(tx).bMIHistory.findMany({
      where: { userId },
      orderBy: { recordedAt: order },
    });
  }

  /**
   * History rows since a cut-off date, ascending. Backs the Progress
   * date-range presets (7D/30D/90D/1Y) without duplicating the trend query.
   */
  findHistorySince(
    userId: string,
    since: Date,
    tx?: PrismaTx,
  ): Promise<{ recordedAt: Date; weightKg: number; bmi: number }[]> {
    return this.db(tx).bMIHistory.findMany({
      where: { userId, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
      select: { recordedAt: true, weightKg: true, bmi: true },
    });
  }

  /** Weight trend for the dashboard: ascending, minimal projection. */
  findWeightTrendByUser(
    userId: string,
    tx?: PrismaTx,
  ): Promise<{ recordedAt: Date; weightKg: number }[]> {
    return this.db(tx).bMIHistory.findMany({
      where: { userId },
      orderBy: { recordedAt: 'asc' },
      select: { recordedAt: true, weightKg: true },
    });
  }
}
