import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserProfile } from '@prisma/client';
import { UsersRepository } from './users.repository';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import {
  UserProfileResponse,
} from './types/user-profile.type';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

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
      const created = await this.usersRepository.createProfile({
          userId,
          firstName: this.requireField(dto.fullName, 'fullName'),
          lastName: '',
          dateOfBirth: new Date(
            this.requireField(dto.dateOfBirth, 'dateOfBirth'),
          ),
          gender: this.requireField(dto.gender, 'gender'),
          avatarUrl: dto.avatarUrl,
      });
      return this.toResponse(created);
    }

    // ACC3 has no UserProfileHistory equivalent and no ACC1 consumer reads
    // profile history, so no compatibility model was added for it.
    const pExisting = existing as any;
    const updated = await this.usersRepository.runInTransaction(async (tx) =>
      this.usersRepository.updateProfile(
        existing.id,
        {
          firstName: dto.fullName ?? existing.firstName,
          dateOfBirth: dto.dateOfBirth
            ? new Date(dto.dateOfBirth)
            : existing.dateOfBirth,
          gender: dto.gender ?? existing.gender,
          avatarUrl: dto.avatarUrl ?? existing.avatarUrl,
        },
        tx,
      ),
    );

    return this.toResponse(updated);
  }


  async softDeleteMyProfile(userId: string): Promise<void> {
    const profile = await this.findActiveProfile(userId);
    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    await this.usersRepository.softDeleteProfile(profile.id);
  }

  private async findActiveProfile(
    userId: string,
  ): Promise<(UserProfile & { user?: { email: string } }) | null> {
    return this.usersRepository.findActiveProfile(userId);
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

  private toResponse(
    profile: UserProfile & { user?: { email: string } },
  ): UserProfileResponse {
    const p = profile as any;
    const fullName = p.fullName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    const dob = profile.dateOfBirth || new Date();
    return {
      id: profile.id,
      userId: profile.userId,
      fullName: fullName,
      email: profile.user?.email ?? '',
      dateOfBirth: dob,
      gender: profile.gender || 'OTHER',
      phone: p.phoneNumber || null,
      region: p.region || null,
      city: p.city || null,
      country: p.country || 'India',
      language: p.language || 'en',
      avatarUrl: profile.avatarUrl,
      age: this.calculateAge(dob),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
