import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
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
    userRoles: [{ role: { name: 'USER' } }],
    status: 'ACTIVE',
    emailVerified: true,
    onboardingComplete: false,
    profile: { fullName: 'Test User' },
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
        { provide: AuthRepository, useValue: new AuthRepository(prisma as any) },
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
      // Canonical ACC1 contract: { user, tokens }
      expect(result.tokens.accessToken).toBe('signed.jwt.token');
      expect(result.tokens.refreshToken).toHaveLength(128); // 64 bytes hex
      expect(typeof result.tokens.accessTokenExpiresAt).toBe('string');
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user).toHaveProperty('onboardingCompleted');
      expect(result.user).toHaveProperty('subscriptionTier');
    });

    it('throws when Firebase rejects the token', async () => {
      firebaseApp.auth().verifyIdToken.mockRejectedValueOnce(new Error('bad token'));
      await expect(service.loginWithFirebase('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it.each(['SUSPENDED', 'BLOCKED'])(
      'denies login for a %s account',
      async (status) => {
        prisma.user.upsert.mockResolvedValueOnce({ ...mockUser, status });
        await expect(service.loginWithFirebase('valid-id-token')).rejects.toThrow(
          UnauthorizedException,
        );
      },
    );

    it('permits login for an ACTIVE account', async () => {
      const result = await service.loginWithFirebase('valid-id-token');
      expect(result.tokens.accessToken).toBe('signed.jwt.token');
    });
  });

  describe('account status across the refresh flow (CONFLICT-3)', () => {
    const storedToken = (status: string) => ({
      id: 'rt_1',
      userId: mockUser.id,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      user: { ...mockUser, status },
    });

    it.each(['SUSPENDED', 'BLOCKED'])(
      'denies refresh for a %s account, so a live token cannot outlive the status change',
      async (status) => {
        prisma.refreshToken.findUnique.mockResolvedValueOnce(storedToken(status));
        await expect(service.refresh('raw-refresh-token')).rejects.toThrow(
          UnauthorizedException,
        );
      },
    );

    it('permits refresh for an ACTIVE account', async () => {
      prisma.refreshToken.findUnique.mockResolvedValueOnce(storedToken('ACTIVE'));
      const result = await service.refresh('raw-refresh-token');
      expect(result.accessToken).toBe('signed.jwt.token');
    });
  });

  describe('refresh', () => {
    it('rotates a valid refresh token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValueOnce({
        id: 'rt_1',
        userId: mockUser.id,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        user: mockUser,
      });

      const result = await service.refresh('raw-refresh-token');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rt_1' },
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
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
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        user: mockUser,
      });

      await expect(service.refresh('stolen-token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id, revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('rejects an expired token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValueOnce({
        id: 'rt_3',
        userId: mockUser.id,
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000),
        user: mockUser,
      });

      await expect(service.refresh('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
