import { Injectable } from '@nestjs/common';
import { Prisma, UserProfile } from '@prisma/client';
import { BaseRepository } from '../../database/base.repository';
import { PrismaTx } from '../../database/prisma-tx.type';

/** Persistence for the User domain (UserProfile + its history). */
@Injectable()
export class UsersRepository extends BaseRepository {
  findActiveProfile(
    userId: string,
    tx?: PrismaTx,
  ): Promise<(UserProfile & { user?: { email: string } }) | null> {
    return this.db(tx).userProfile.findFirst({
      where: { userId, deletedAt: null },
      include: { user: { select: { email: true } } },
    });
  }

  findProfileById(id: string, tx?: PrismaTx): Promise<UserProfile | null> {
    return this.db(tx).userProfile.findFirst({ where: { id, deletedAt: null } });
  }

  createProfile(
    data: Prisma.UserProfileUncheckedCreateInput,
    tx?: PrismaTx,
  ): Promise<UserProfile> {
    return this.db(tx).userProfile.create({ data });
  }

  updateProfile(
    id: string,
    data: Prisma.UserProfileUncheckedUpdateInput,
    tx?: PrismaTx,
  ): Promise<UserProfile> {
    return this.db(tx).userProfile.update({ where: { id }, data });
  }



  softDeleteProfile(id: string, tx?: PrismaTx): Promise<UserProfile> {
    return this.db(tx).userProfile.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
