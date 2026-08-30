import { Injectable } from '@nestjs/common';
import { Prisma, RefreshToken, User } from '@prisma/client';
import { BaseRepository } from '../../database/base.repository';
import { PrismaTx } from '../../database/prisma-tx.type';

/** Persistence for the Authentication domain: User identity + RefreshToken. */
@Injectable()
export class AuthRepository extends BaseRepository {
  /** Includes canonical roles so the request principal can carry all of them. */
  findUserById(id: string, tx?: PrismaTx): Promise<User | null> {
    return this.db(tx).user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: { select: { name: true } } } } },
    });
  }

  upsertUserByFirebaseUid(
    firebaseUid: string,
    create: Prisma.UserUncheckedCreateInput,
    update: Prisma.UserUncheckedUpdateInput,
    tx?: PrismaTx,
  ): Promise<User & { profile?: { fullName: string } | null }> {
    return this.db(tx).user.upsert({
      where: { firebaseUid },
      create,
      update,
      include: {
        profile: true,
        userRoles: { include: { role: { select: { name: true } } } },
      },
    }) as Promise<User & { profile?: { fullName: string } | null }>;
  }

  markOnboardingCompleted(userId: string, tx?: PrismaTx): Promise<User> {
    return this.db(tx).user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });
  }

  createRefreshToken(
    data: Prisma.RefreshTokenUncheckedCreateInput,
    tx?: PrismaTx,
  ): Promise<RefreshToken> {
    return this.db(tx).refreshToken.create({ data });
  }

  findRefreshTokenByHash(
    tokenHash: string,
    tx?: PrismaTx,
  ): Promise<(RefreshToken & { user: User }) | null> {
    return this.db(tx).refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    }) as Promise<(RefreshToken & { user: User }) | null>;
  }

  updateRefreshToken(
    id: string,
    data: Prisma.RefreshTokenUncheckedUpdateInput,
    tx?: PrismaTx,
  ): Promise<RefreshToken> {
    return this.db(tx).refreshToken.update({ where: { id }, data });
  }

  revokeAllForUser(userId: string, tx?: PrismaTx): Promise<{ count: number }> {
    return this.db(tx).refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  revokeByHash(userId: string, tokenHash: string, tx?: PrismaTx): Promise<{ count: number }> {
    return this.db(tx).refreshToken.updateMany({
      where: { userId, tokenHash },
      data: { revokedAt: new Date() },
    });
  }
}
