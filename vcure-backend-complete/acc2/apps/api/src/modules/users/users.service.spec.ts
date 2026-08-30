import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    userProfile: { findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
    userProfileHistory: { create: jest.Mock; findMany: jest.Mock };
    $transaction: jest.Mock;
  };

  const existingProfile = {
    id: 'profile_1',
    userId: 'user_1',
    fullName: 'Sriram Original',
    dateOfBirth: new Date('1995-06-15'),
    gender: 'MALE',
    phoneNumber: '9999999999',
    region: 'Andhra Pradesh',
    city: 'Vijayawada',
    country: 'India',
    language: 'en',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      userProfile: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      userProfileHistory: {
        create: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: new UsersRepository(prisma as any) },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('getMyProfile', () => {
    it('returns the profile with computed age', async () => {
      prisma.userProfile.findFirst.mockResolvedValueOnce(existingProfile);
      const result = await service.getMyProfile('user_1');
      expect(result.fullName).toBe('Sriram Original');
      expect(typeof result.age).toBe('number');
    });

    it('throws NotFoundException when no profile exists', async () => {
      prisma.userProfile.findFirst.mockResolvedValueOnce(null);
      await expect(service.getMyProfile('user_1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('upsertMyProfile', () => {
    it('creates a new profile when none exists', async () => {
      prisma.userProfile.findFirst.mockResolvedValueOnce(null);
      prisma.userProfile.create.mockResolvedValueOnce({
        ...existingProfile,
        id: 'profile_new',
      });

      const result = await service.upsertMyProfile('user_1', {
        fullName: 'New User',
        dateOfBirth: '1990-01-01',
        gender: 'FEMALE' as any,
      });

      expect(prisma.userProfile.create).toHaveBeenCalled();
      expect(result.id).toBe('profile_new');
    });

    it('throws when creating without required fields', async () => {
      prisma.userProfile.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.upsertMyProfile('user_1', { region: 'Telangana' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProfileHistory', () => {
  });
});
