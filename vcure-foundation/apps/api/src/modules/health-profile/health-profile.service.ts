import { Injectable, NotFoundException } from '@nestjs/common';
import { HealthProfile, HealthProfileHistory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateHealthProfileDto } from './dto/update-health-profile.dto';
import {
  BmiCategory,
  HealthProfileResponse,
  HealthProfileTrendPoint,
} from './types/health-profile.type';

@Injectable()
export class HealthProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyHealthProfile(userId: string): Promise<HealthProfileResponse> {
    const profile = await this.findActive(userId);
    if (!profile) {
      throw new NotFoundException(
        'Health profile not found. Create one with PUT /health-profile/me',
      );
    }
    return this.toResponse(profile);
  }

  /**
   * Creates or updates the health profile. BMI is always recomputed
   * server-side from height/weight (never trusted from the client).
   * Every write appends a snapshot to HealthProfileHistory so weight/BMI
   * trends can be charted over time.
   */
  async upsertMyHealthProfile(
    userId: string,
    dto: UpdateHealthProfileDto,
  ): Promise<HealthProfileResponse> {
    const existing = await this.findActive(userId);

    const heightCm = dto.heightCm ?? existing?.heightCm;
    const weightKg = dto.weightKg ?? existing?.weightKg;

    if (heightCm === undefined || weightKg === undefined) {
      throw new NotFoundException(
        'heightCm and weightKg are required to create a health profile',
      );
    }

    const bmi = this.computeBmi(heightCm, weightKg);

    const data = {
      heightCm,
      weightKg,
      waistCm: dto.waistCm ?? existing?.waistCm ?? null,
      bmi,
      occupation: dto.occupation ?? existing?.occupation ?? null,
      activityLevel: dto.activityLevel ?? existing?.activityLevel ?? 'MODERATE',
      budgetPerDayINR: dto.budgetPerDayINR ?? existing?.budgetPerDayINR ?? null,
      healthGoals: dto.healthGoals ?? existing?.healthGoals ?? [],
      favoriteFoods: dto.favoriteFoods ?? existing?.favoriteFoods ?? [],
      dislikedFoods: dto.dislikedFoods ?? existing?.dislikedFoods ?? [],
      foodPreference: dto.foodPreference ?? existing?.foodPreference ?? null,
    } as const;

    const saved = existing
      ? await this.prisma.healthProfile.update({
          where: { id: existing.id },
          data,
        })
      : await this.prisma.healthProfile.create({
          data: { userId, ...data },
        });

    await this.prisma.healthProfileHistory.create({
      data: {
        healthProfileId: saved.id,
        heightCm: saved.heightCm,
        weightKg: saved.weightKg,
        waistCm: saved.waistCm,
        bmi: saved.bmi,
      },
    });

    return this.toResponse(saved);
  }

  async getTrends(userId: string): Promise<HealthProfileTrendPoint[]> {
    const profile = await this.findActive(userId);
    if (!profile) {
      throw new NotFoundException('Health profile not found');
    }

    const history = await this.prisma.healthProfileHistory.findMany({
      where: { healthProfileId: profile.id },
      orderBy: { recordedAt: 'asc' },
    });

    return history.map((entry: HealthProfileHistory) => ({
      id: entry.id,
      heightCm: entry.heightCm,
      weightKg: entry.weightKg,
      waistCm: entry.waistCm,
      bmi: entry.bmi,
      bmiCategory: this.categorizeBmi(entry.bmi),
      recordedAt: entry.recordedAt,
    }));
  }

  private async findActive(userId: string): Promise<HealthProfile | null> {
    return this.prisma.healthProfile.findFirst({
      where: { userId, deletedAt: null },
    });
  }

  private computeBmi(heightCm: number, weightKg: number): number {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10; // one decimal place
  }

  private categorizeBmi(bmi: number): BmiCategory {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  private toResponse(profile: HealthProfile): HealthProfileResponse {
    return {
      id: profile.id,
      userId: profile.userId,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      waistCm: profile.waistCm,
      bmi: profile.bmi,
      bmiCategory: this.categorizeBmi(profile.bmi),
      occupation: profile.occupation,
      activityLevel: profile.activityLevel,
      budgetPerDayINR: profile.budgetPerDayINR,
      healthGoals: profile.healthGoals,
      favoriteFoods: profile.favoriteFoods,
      dislikedFoods: profile.dislikedFoods,
      foodPreference: profile.foodPreference,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
