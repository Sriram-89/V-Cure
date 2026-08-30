import { Injectable } from '@nestjs/common';
import { Lifestyle, Prisma } from '@prisma/client';
import { BaseRepository } from '../../database/base.repository';
import { PrismaTx } from '../../database/prisma-tx.type';

/** Persistence for Lifestyle + its history. */
@Injectable()
export class LifestyleAssessmentRepository extends BaseRepository {
  findActive(
    userId: string,
    tx?: PrismaTx,
  ): Promise<Lifestyle | null> {
    return this.db(tx).lifestyle.findFirst({
      where: { userId, deletedAt: null },
    });
  }

  create(
    data: Prisma.LifestyleUncheckedCreateInput,
    tx?: PrismaTx,
  ): Promise<Lifestyle> {
    return this.db(tx).lifestyle.create({ data });
  }

  update(
    id: string,
    data: Prisma.LifestyleUncheckedUpdateInput,
    tx?: PrismaTx,
  ): Promise<Lifestyle> {
    return this.db(tx).lifestyle.update({ where: { id }, data });
  }

  upsertByUserId(
    userId: string,
    create: Prisma.LifestyleUncheckedCreateInput,
    update: Prisma.LifestyleUncheckedUpdateInput,
    tx?: PrismaTx,
  ): Promise<Lifestyle> {
    return this.db(tx).lifestyle.upsert({
      where: { userId },
      create,
      update,
    });
  }

  /** Canonical DailyLifestyle: one row per user per day, upserted. */
  upsertDaily(
    userId: string,
    date: Date,
    data: { sleepHours: number | null; stressLevel: string | null },
    tx?: PrismaTx,
  ): Promise<unknown> {
    return this.db(tx).dailyLifestyle.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, ...data },
      update: data,
    });
  }

  findHistory(
    userId: string,
    order: 'asc' | 'desc' = 'asc',
    tx?: PrismaTx,
  ): Promise<any[]> {
    return this.db(tx).dailyLifestyle.findMany({
      where: { userId },
      orderBy: { date: order },
    });
  }
}
