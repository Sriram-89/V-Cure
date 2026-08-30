import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserProfile, UserProfileHistory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import {
  UserProfileHistoryEntry,
  UserProfileResponse,
} from './types/user-profile.type';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string): Promise<UserProfileResponse> {
    const profile = await this.findActiveProfile(userId);
    if (!profile) {
      throw new NotFoundException(
        'User profile not found. Create one with PUT /users/me/profile',
      );
    }
    return this.toResponse(profile);
  }

  /**
   * Creates the profile on first call, or updates it on subsequent calls.
   * Every update writes the PRE-update snapshot to UserProfileHistory,
   * preserving a full audit/revision trail.
   */
  async upsertMyProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfileResponse> {
    const existing = await this.findActiveProfile(userId);

    if (!existing) {
      const created = await this.prisma.userProfile.create({
        data: {
          userId,
          fullName: this.requireField(dto.fullName, 'fullName'),
          dateOfBirth: new Date(
            this.requireField(dto.dateOfBirth, 'dateOfBirth'),
          ),
          gender: this.requireField(dto.gender, 'gender'),
          phoneNumber: dto.phoneNumber,
          region: dto.region,
          city: dto.city,
          country: dto.country ?? 'India',
          language: dto.language ?? 'en',
          avatarUrl: dto.avatarUrl,
        },
      });
      return this.toResponse(created);
    }

    const updated = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.userProfileHistory.create({
        data: {
          userProfileId: existing.id,
          fullName: existing.fullName,
          dateOfBirth: existing.dateOfBirth,
          gender: existing.gender,
          phoneNumber: existing.phoneNumber,
          region: existing.region,
          city: existing.city,
          country: existing.country,
          language: existing.language,
          avatarUrl: existing.avatarUrl,
        },
      });

      return tx.userProfile.update({
        where: { id: existing.id },
        data: {
          fullName: dto.fullName ?? existing.fullName,
          dateOfBirth: dto.dateOfBirth
            ? new Date(dto.dateOfBirth)
            : existing.dateOfBirth,
          gender: dto.gender ?? existing.gender,
          phoneNumber: dto.phoneNumber ?? existing.phoneNumber,
          region: dto.region ?? existing.region,
          city: dto.city ?? existing.city,
          country: dto.country ?? existing.country,
          language: dto.language ?? existing.language,
          avatarUrl: dto.avatarUrl ?? existing.avatarUrl,
        },
      });
    });

    return this.toResponse(updated);
  }

  async getProfileHistory(userId: string): Promise<UserProfileHistoryEntry[]> {
    const profile = await this.findActiveProfile(userId);
    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    const history = await this.prisma.userProfileHistory.findMany({
      where: { userProfileId: profile.id },
      orderBy: { recordedAt: 'desc' },
    });

    return history.map((entry: UserProfileHistory) => ({
      id: entry.id,
      fullName: entry.fullName,
      dateOfBirth: entry.dateOfBirth,
      gender: entry.gender,
      phoneNumber: entry.phoneNumber,
      region: entry.region,
      city: entry.city,
      country: entry.country,
      language: entry.language,
      avatarUrl: entry.avatarUrl,
      recordedAt: entry.recordedAt,
    }));
  }

  async softDeleteMyProfile(userId: string): Promise<void> {
    const profile = await this.findActiveProfile(userId);
    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: { deletedAt: new Date() },
    });
  }

  private async findActiveProfile(userId: string): Promise<UserProfile | null> {
    return this.prisma.userProfile.findFirst({
      where: { userId, deletedAt: null },
    });
  }

  private requireField<T>(value: T | undefined, fieldName: string): T {
    if (value === undefined || value === null) {
      throw new BadRequestException(
        `${fieldName} is required to create a profile`,
      );
    }
    return value;
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
    ) {
      age--;
    }
    return age;
  }

  private toResponse(profile: UserProfile): UserProfileResponse {
    return {
      id: profile.id,
      userId: profile.userId,
      fullName: profile.fullName,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      phoneNumber: profile.phoneNumber,
      region: profile.region,
      city: profile.city,
      country: profile.country,
      language: profile.language,
      avatarUrl: profile.avatarUrl,
      age: this.calculateAge(profile.dateOfBirth),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
