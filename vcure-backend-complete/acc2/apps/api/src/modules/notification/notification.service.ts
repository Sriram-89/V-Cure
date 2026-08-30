import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { NotificationRepository } from './notification.repository';
import { NotificationResponse } from './types/notification.type';

@Injectable()
export class NotificationService {
  constructor(private readonly repository: NotificationRepository) {}

  /**
   * API 59. Notifications are system-generated; the Bible documents no
   * create endpoint, so none is exposed here.
   */
  async listMine(userId: string): Promise<NotificationResponse[]> {
    const records = await this.repository.findManyForUser(userId);
    return records.map((r) => this.toResponse(r));
  }

  /** API 60. Returns the updated item, which is what ACC1's adapter expects. */
  async markAsRead(userId: string, id: string): Promise<NotificationResponse> {
    await this.findOwnedOrThrow(userId, id);
    const updated = await this.repository.update(id, { isRead: true });
    return this.toResponse(updated);
  }

  /**
   * API 61. Soft delete only (RULE-019/063). The 90-day retention in 03 §67
   * is a separate purge concern and is NOT implemented here — see C-03.
   */
  async remove(userId: string, id: string): Promise<void> {
    await this.findOwnedOrThrow(userId, id);
    await this.repository.update(id, { deletedAt: new Date() });
  }

  private async findOwnedOrThrow(
    userId: string,
    id: string,
  ): Promise<Notification> {
    const record = await this.repository.findOwnedById(id, userId);
    if (!record) {
      throw new NotFoundException('Notification not found');
    }
    return record;
  }

  private toResponse(record: Notification): NotificationResponse {
    return {
      id: record.id,
      type: record.type,
      title: record.title,
      message: record.message,
      isRead: record.isRead,
      createdAt: record.createdAt,
      ...(record.actionRoute ? { actionRoute: record.actionRoute } : {}),
    };
  }
}
