import { Injectable } from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';
import { BaseRepository } from '../../database/base.repository';
import { PrismaTx } from '../../database/prisma-tx.type';

/** Persistence for the per-user notification inbox (API 59/60/61). */
@Injectable()
export class NotificationRepository extends BaseRepository {
  findManyForUser(userId: string, tx?: PrismaTx): Promise<Notification[]> {
    return this.db(tx).notification.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOwnedById(
    id: string,
    userId: string,
    tx?: PrismaTx,
  ): Promise<Notification | null> {
    return this.db(tx).notification.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  update(
    id: string,
    data: Prisma.NotificationUncheckedUpdateInput,
    tx?: PrismaTx,
  ): Promise<Notification> {
    return this.db(tx).notification.update({ where: { id }, data });
  }
}
