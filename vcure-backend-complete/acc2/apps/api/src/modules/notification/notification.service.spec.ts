import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: any;

  const record = {
    id: '11111111-1111-4111-8111-111111111111',
    userId: 'user_1',
    type: 'MEAL_REMINDER',
    title: 'Time for lunch',
    message: 'Your planned lunch is due.',
    isRead: false,
    actionRoute: '/meals',
    createdAt: new Date('2026-03-01T12:00:00.000Z'),
  };

  beforeEach(async () => {
    prisma = {
      notification: {
        findMany: jest.fn().mockResolvedValue([record]),
        findFirst: jest.fn().mockResolvedValue(record),
        update: jest.fn().mockResolvedValue({ ...record, isRead: true }),
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: NotificationRepository,
          useValue: new NotificationRepository(prisma as unknown as PrismaService),
        },
      ],
    }).compile();
    service = moduleRef.get(NotificationService);
  });

  it('returns the ACC1 NotificationItem shape', async () => {
    const [item] = await service.listMine('user_1');
    expect(item).toEqual({
      id: record.id,
      type: 'MEAL_REMINDER',
      title: record.title,
      message: record.message,
      isRead: false,
      createdAt: record.createdAt,
      actionRoute: '/meals',
    });
  });

  it('omits actionRoute when the notification has none', async () => {
    prisma.notification.findMany.mockResolvedValueOnce([
      { ...record, actionRoute: null },
    ]);
    const [item] = await service.listMine('user_1');
    expect(item).not.toHaveProperty('actionRoute');
  });

  it('scopes the list to the user and excludes soft-deleted rows', async () => {
    await service.listMine('user_1');
    expect(prisma.notification.findMany).toHaveBeenCalledWith({
      where: { userId: 'user_1', deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('marks as read and returns the updated item', async () => {
    const result = await service.markAsRead('user_1', record.id);
    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: record.id },
      data: { isRead: true },
    });
    expect(result.isRead).toBe(true);
  });

  it('soft-deletes rather than hard-deleting', async () => {
    await service.remove('user_1', record.id);
    const arg = prisma.notification.update.mock.calls[0][0];
    expect(arg.data.deletedAt).toBeInstanceOf(Date);
  });

  it('rejects access to another user\'s notification', async () => {
    prisma.notification.findFirst.mockResolvedValueOnce(null);
    await expect(service.markAsRead('user_1', record.id)).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.notification.update).not.toHaveBeenCalled();
  });
});
