import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FIREBASE_ADMIN } from './firebase-admin.provider';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { upsert: jest.Mock; findUnique: jest.Mock };
    refreshToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };
  let firebaseApp: { auth: jest.Mock };

  const mockUser = {
    id: 'user_1',
    email: 'test@vcure.app',
    role: 'USER',
    subscriptionTier: 'FREE',
    isActive: true,
  };

  beforeEach(async () => {
    prisma = {
      user: {
        upsert: jest.fn().mockResolvedValue(mockUser),
        findUnique: jest.fn(),
      },
      refreshToken: {
        create: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({}),
      },
    };

    const verifyIdToken = jest.fn().mockResolvedValue({
      uid: 'firebase_uid_1',
      email: mockUser.email,
      email_verified: true,
    });
    firebaseApp = { auth: jest.fn().mockReturnValue({ verifyIdToken }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              accessSecret: 'secret',
              accessExpiry: '15m',
              refreshSecret: 'refresh-secret',
              refreshExpiry: '30d',
            }),
          },
        },
        { provide: FIREBASE_ADMIN, useValue: firebaseApp },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('loginWithFirebase', () => {
    it('provisions the user and returns tokens', async () => {
      const result = await service.loginWithFirebase('valid-id-token');

      expect(prisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { firebaseUid: 'firebase_uid_1' },
        }),
      );
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.refreshToken).toHaveLength(128); // 64 bytes hex-encoded
      expect(result.user.email).toBe(mockUser.email);
    });

    it('throws when Firebase rejects the token', async () => {
      firebaseApp.auth().verifyIdToken.mockRejectedValueOnce(new Error('bad token'));
      await expect(service.loginWithFirebase('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws when the account is deactivated', async () => {
      prisma.user.upsert.mockResolvedValueOnce({ ...mockUser, isActive: false });
      await expect(service.loginWithFirebase('valid-id-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('rotates a valid refresh token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValueOnce({
        id: 'rt_1',
        userId: mockUser.id,
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        user: mockUser,
      });

      const result = await service.refresh('raw-refresh-token');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rt_1' },
          data: expect.objectContaining({ isRevoked: true }),
        }),
      );
      expect(result.accessToken).toBe('signed.jwt.token');
    });

    it('rejects an unrecognized token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValueOnce(null);
      await expect(service.refresh('unknown-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('revokes the whole session chain on reuse of a revoked token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValueOnce({
        id: 'rt_2',
        userId: mockUser.id,
        isRevoked: true,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        user: mockUser,
      });

      await expect(service.refresh('stolen-token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id, isRevoked: false },
        data: { isRevoked: true },
      });
    });

    it('rejects an expired token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValueOnce({
        id: 'rt_3',
        userId: mockUser.id,
        isRevoked: false,
        expiresAt: new Date(Date.now() - 1000),
        user: mockUser,
      });

      await expect(service.refresh('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
