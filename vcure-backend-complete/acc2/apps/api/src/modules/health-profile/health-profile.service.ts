import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { GoalType, HealthProfile, PrimaryGoal } from '@prisma/client';
import { HealthProfileRepository } from './health-profile.repository';
import { UpdateHealthProfileDto } from './dto/update-health-profile.dto';
import { UpdateGoalsDto } from './dto/update-goals.dto';
import {
  BmiCategory,
  HealthGoalResponse,
  HealthProfileResponse,
  HealthProfileTrendPoint,
} from './types/health-profile.type';

@Injectable()
export class HealthProfileService {
  constructor(private readonly repository: HealthProfileRepository) {}

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

    // ACC3 requires age, gender, activityLevel and primaryGoal non-null.
    // Partial PATCH preserves existing canonical values; on first create age
    // and gender are DERIVED from UserProfile rather than stored twice.
    let age = existing?.age;
    let gender = existing?.gender;
    if (age === undefined || gender === undefined) {
      const profile = await this.repository.findUserProfile(userId);
      if (!profile) {
        throw new UnprocessableEntityException(
          'A user profile with dateOfBirth and gender is required before a ' +
            'health profile can be created: the canonical HealthProfile stores ' +
            'age and gender, and neither may be invented.',
        );
      }
      age = age ?? this.deriveAge(profile.dateOfBirth);
      gender = gender ?? profile.gender;
    }

    const data = {
      age,
      gender,
      heightCm,
      weightKg,
      waistCm: dto.waistCm ?? existing?.waistCm ?? null,
      bmi,
      activityLevel:
        dto.activityLevel ?? existing?.activityLevel ?? 'MODERATELY_ACTIVE',
      primaryGoal: existing?.primaryGoal ?? 'GENERAL_WELLNESS',
      bloodGroup: dto.bloodGroup ?? existing?.bloodGroup ?? null,
      goalTimeline: existing?.goalTimeline ?? null,
      targetWeightKg: existing?.targetWeightKg ?? null,
    } as const;

    const saved = existing
      ? await this.repository.update(existing.id, data)
      : await this.repository.create({ userId, ...data });

    // Canonical BMIHistory (ACC3) replaces ACC2's HealthProfileHistory.
    await this.repository.createHistory({
      userId,
      bmi: saved.bmi,
      weightKg: saved.weightKg,
      heightCm: saved.heightCm,
    });

    return this.toResponse(saved);
  }

  async getTrends(userId: string): Promise<HealthProfileTrendPoint[]> {
    const profile = await this.findActive(userId);
    if (!profile) {
      throw new NotFoundException('Health profile not found');
    }

    const history = await this.repository.findHistory(userId, 'asc');

    return history.map(
      (entry: {
        id: string;
        heightCm: number;
        weightKg: number;
        bmi: number;
        recordedAt: Date;
      }) => ({
      id: entry.id,
      heightCm: entry.heightCm,
      weightKg: entry.weightKg,
      // ACC3's BMIHistory does not carry waist; it lives on BodyMeasurements.
      waistCm: null,
      bmi: entry.bmi,
      bmiCategory: this.categorizeBmi(entry.bmi),
      recordedAt: entry.recordedAt,
      }),
    );
  }

  /**
   * Goals are persisted on HealthProfile (primaryGoal / goalTimeline /
   * targetWeightKg). Returns nulls when no profile exists yet rather than
   * throwing — ACC1 renders an empty goals form in that state.
   */
  async getMyGoals(userId: string): Promise<HealthGoalResponse> {
    const profile = await this.findActive(userId);
    return {
      primaryGoal: profile ? this.toAcc1Goal(profile.primaryGoal) : null,
      timeline: profile?.goalTimeline ?? null,
      targetWeightKg: profile?.targetWeightKg ?? null,
    };
  }

  async updateMyGoals(
    userId: string,
    dto: UpdateGoalsDto,
  ): Promise<HealthGoalResponse> {
    const existing = await this.findActive(userId);
    if (!existing) {
      throw new NotFoundException(
        'Health profile not found. Create it before setting goals.',
      );
    }
    const updated = await this.repository.update(existing.id, {
      primaryGoal: dto.primaryGoal
        ? this.toCanonicalGoal(dto.primaryGoal)
        : existing.primaryGoal,
      goalTimeline: dto.timeline ?? existing.goalTimeline,
      targetWeightKg: dto.targetWeightKg ?? existing.targetWeightKg,
    });
    return {
      primaryGoal: this.toAcc1Goal(updated.primaryGoal),
      timeline: updated.goalTimeline,
      targetWeightKg: updated.targetWeightKg,
    };
  }

  /**
   * F-11: only three of ACC1's five PrimaryGoal values exist in ACC3's
   * canonical GoalType. MANAGE_CONDITION -> DISEASE_MANAGEMENT and
   * IMPROVE_FITNESS -> ATHLETIC_PERFORMANCE are plausible but NOT proven by
   * any source, so they are rejected rather than mapped by assumption.
   */
  toCanonicalGoalPublic(goal: string): GoalType {
    return this.toCanonicalGoal(goal);
  }

  /** Public so OnboardingService can derive age with the same single rule. */
  deriveAgeFrom(dateOfBirth: Date): number {
    return this.deriveAge(dateOfBirth);
  }

  private toCanonicalGoal(goal: string): GoalType {
    const deterministic: Record<string, GoalType> = {
      WEIGHT_LOSS: 'WEIGHT_LOSS',
      WEIGHT_GAIN: 'WEIGHT_GAIN',
      GENERAL_WELLNESS: 'GENERAL_WELLNESS',
    };
    const mapped = deterministic[goal];
    if (!mapped) {
      throw new UnprocessableEntityException(
        `Goal "${goal}" has no deterministic canonical equivalent (F-11). ` +
          'Supported goals: WEIGHT_LOSS, WEIGHT_GAIN, GENERAL_WELLNESS.',
      );
    }
    return mapped;
  }

  /** Canonical -> ACC1. Values outside ACC1's union surface as null. */
  private toAcc1Goal(goal: GoalType): PrimaryGoal | null {
    return ['WEIGHT_LOSS', 'WEIGHT_GAIN', 'GENERAL_WELLNESS'].includes(goal)
      ? (goal as unknown as PrimaryGoal)
      : null;
  }

  /**
   * Single age-derivation rule for the backend: completed years since
   * dateOfBirth, decremented when this year's birthday has not yet passed.
   */
  private deriveAge(dateOfBirth: Date): number {
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

  private async findActive(userId: string): Promise<HealthProfile | null> {
    return this.repository.findActive(userId);
  }

  /** Public so OnboardingService can reuse it — single source of truth. */
  computeBmi(heightCm: number, weightKg: number): number {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10; // one decimal place
  }

  /**
   * CLINICAL THRESHOLDS — UNRESOLVED DECISION (D-5 / RISK-3).
   *
   * These cut-offs (18.5 / 25 / 30) are WHO international values. They are NOT
   * specified anywhere in the Engineering Bible, and 01 §2 states an
   * India-first product, for which Asian-Indian cut-offs differ materially.
   *
   * TODO(clinical-approval): thresholds require authoritative product/clinical
   * confirmation. Preserved unchanged pending that decision — do not alter,
   * duplicate in a controller, reimplement in ACC1, or move to ACC3 until real
   * ACC3 source and an explicit ruling exist. Only the output CASING was
   * changed here, to satisfy the ACC1 contract (D-4).
   */
  /** Public so DashboardService can reuse it — thresholds live in one place. */
  categorizeBmi(bmi: number): BmiCategory {
    if (bmi < 18.5) return 'UNDERWEIGHT';
    if (bmi < 25) return 'NORMAL';
    if (bmi < 30) return 'OVERWEIGHT';
    return 'OBESE';
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
      activityLevel: profile.activityLevel,
      bloodGroup: profile.bloodGroup,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
