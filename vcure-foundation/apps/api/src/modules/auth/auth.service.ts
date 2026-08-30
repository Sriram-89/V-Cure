import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { FIREBASE_ADMIN } from './firebase-admin.provider';
import { AppConfig } from '../../config/configuration';
import {
  AuthResponse,
  AuthTokens,
  JwtAccessPayload,
} from './types/auth-tokens.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
    @Inject(FIREBASE_ADMIN) private readonly firebaseApp: admin.app.App,
  ) {}

  /**
   * Verifies a Firebase ID token, provisions the user record on first
   * sign-in (idempotent), and issues internal access + refresh tokens.
   */
  async loginWithFirebase(idToken: string): Promise<AuthResponse> {
    let decoded: admin.auth.DecodedIdToken;

    try {
      decoded = await this.firebaseApp.auth().verifyIdToken(idToken);
    } catch (error) {
      this.logger.warn(`Firebase token verification failed: ${error}`);
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    const { uid, email, email_verified } = decoded;

    if (!email) {
      throw new UnauthorizedException('Firebase account has no associated email');
    }

    const user = await this.prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {
        isEmailVerified: !!email_verified,
      },
      create: {
        firebaseUid: uid,
        email,
        isEmailVerified: !!email_verified,
      },
    });

    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
      },
    };
  }

  /**
   * Rotates a refresh token: validates the presented token, revokes it,
   * and issues a fresh access + refresh pair. Reuse of a revoked token
   * is treated as a compromise signal and revokes the entire chain.
   */
  async refresh(rawRefreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(rawRefreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException('Refresh token not recognized');
    }

    if (stored.isRevoked) {
      // Possible token theft/reuse — revoke all active tokens for this user.
      await this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, isRevoked: false },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException(
        'Refresh token has already been used; all sessions revoked',
      );
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    if (!stored.user.isActive) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    const tokens = await this.issueTokens(
      stored.user.id,
      stored.user.email,
      stored.user.role,
    );

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true, replacedBy: tokens.refreshToken.slice(0, 12) },
    });

    return tokens;
  }

  async logout(userId: string, rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { userId, tokenHash },
      data: { isRevoked: true },
    });
  }

  async logoutAllSessions(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<AuthTokens> {
    const jwtConfig = this.configService.get('jwt', { infer: true });

    const payload: JwtAccessPayload = { sub: userId, email, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConfig.accessSecret,
      expiresIn: jwtConfig.accessExpiry,
    });

    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = this.computeRefreshExpiry(jwtConfig.refreshExpiry);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: this.parseExpirySeconds(jwtConfig.accessExpiry),
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private computeRefreshExpiry(expiry: string): Date {
    const seconds = this.parseExpirySeconds(expiry);
    return new Date(Date.now() + seconds * 1000);
  }

  private parseExpirySeconds(expiry: string): number {
    const match = /^(\d+)([smhd])$/.exec(expiry);
    if (!match) return 900; // default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };
    return value * multipliers[unit];
  }
}
