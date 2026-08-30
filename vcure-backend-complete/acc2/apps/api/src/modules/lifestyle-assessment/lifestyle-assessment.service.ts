import { Injectable, NotFoundException } from '@nestjs/common';
import { Lifestyle } from '@prisma/client';
import { LifestyleAssessmentRepository } from './lifestyle-assessment.repository';
import { UpdateLifestyleAssessmentDto } from './dto/update-lifestyle-assessment.dto';
import {
  LifestyleAssessmentResponse,
  LifestyleAssessmentTrendPoint,
} from './types/lifestyle-assessment.type';

@Injectable()
export class LifestyleAssessmentService {
  constructor(private readonly repository: LifestyleAssessmentRepository) {}

  async getMyAssessment(userId: string): Promise<LifestyleAssessmentResponse> {
    const assessment = await this.findActive(userId);
    if (!assessment) {
      throw new NotFoundException(
        'Lifestyle assessment not found. Create one with PUT /lifestyle-assessment/me',
      );
    }
    return this.toResponse(assessment);
  }

  /**
   * Creates or updates the lifestyle assessment. Every write appends a
   * trend snapshot to LifestyleHistory (sleep/stress/water/
   * exercise history feeds the daily recommendation engine later).
   */
  async upsertMyAssessment(
    userId: string,
    dto: UpdateLifestyleAssessmentDto,
  ): Promise<LifestyleAssessmentResponse> {
    const existing = await this.findActive(userId);

    const data = {
      activityLevel: existing?.activityLevel ?? 'MODERATELY_ACTIVE',
      dietType: dto.dietType ?? existing?.dietType ?? null,
      sleepHoursAvg: dto.sleepHoursAvg ?? existing?.sleepHoursAvg ?? null,
      stressLevel: dto.stressLevel ?? existing?.stressLevel ?? null,
      waterIntakeLitersAvg:
        dto.waterIntakeLitersAvg ?? existing?.waterIntakeLitersAvg ?? null,
      smokingStatus:
        dto.smokingStatus ?? existing?.smokingStatus ?? 'NEVER',
      alcoholStatus:
        dto.alcoholConsumption ?? existing?.alcoholStatus ?? 'NONE',
      exerciseFrequencyPerWeek:
        dto.exerciseFrequencyPerWeek ??
        existing?.exerciseFrequencyPerWeek ??
        null,
    } as const;

    const saved = existing
      ? await this.repository.update(existing.id, data)
      : await this.repository.create({ userId, ...data });

    // Canonical DailyLifestyle is one row per user per day and holds only
    // sleep/stress/screen-time — it is upserted, not appended. The wider
    // snapshot ACC2 previously stored has no canonical home and no ACC1
    // consumer, so no compatibility columns were added for it.
    await this.repository.upsertDaily(userId, this.utcDay(new Date()), {
      sleepHours: saved.sleepHoursAvg,
      stressLevel: saved.stressLevel,
    });

    return this.toResponse(saved);
  }

  async getTrends(userId: string): Promise<LifestyleAssessmentTrendPoint[]> {
    const assessment = await this.findActive(userId);
    if (!assessment) {
      throw new NotFoundException('Lifestyle assessment not found');
    }

    const history = await this.repository.findHistory(userId, 'asc');

    return history.map(
      (entry: {
        id: string;
        sleepHours: number | null;
        stressLevel: string | null;
        date: Date;
      }) => ({
        id: entry.id,
        sleepHoursAvg: entry.sleepHours,
        stressLevel: entry.stressLevel,
        recordedAt: entry.date,
      }),
    );
  }

  private async findActive(
    userId: string,
  ): Promise<Lifestyle | null> {
    return this.repository.findActive(userId);
  }

  /**
   * Purely descriptive, threshold-based tags on self-reported lifestyle
   * data (e.g. "low_sleep", "sedentary"). These are NOT medical
   * assessments or diagnoses — they only flag inputs the future
   * recommendation engine should weigh more carefully. Never surfaced
   * as health advice by this module.
   */
  /**
   * Reusable by OnboardingService and DashboardService so risk-flag logic
   * exists in exactly one place. Returns [] when no assessment exists.
   */
  async getRiskFlags(userId: string): Promise<string[]> {
    const profile = await this.repository.findActive(userId);
    return profile ? this.deriveRiskFlags(profile) : [];
  }

  /** UTC day key for the canonical one-row-per-day DailyLifestyle. */
  private utcDay(at: Date): Date {
    return new Date(
      Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate()),
    );
  }

  private deriveRiskFlags(profile: Lifestyle): string[] {
    const flags: string[] = [];

    if (profile.sleepHoursAvg !== null && profile.sleepHoursAvg < 6) {
      flags.push('low_sleep');
    }
    if (profile.stressLevel === 'HIGH' || profile.stressLevel === 'SEVERE') {
      flags.push('elevated_stress');
    }
    if (
      profile.waterIntakeLitersAvg !== null &&
      profile.waterIntakeLitersAvg < 1.5
    ) {
      flags.push('low_water_intake');
    }
    if (
      profile.exerciseFrequencyPerWeek !== null &&
      profile.exerciseFrequencyPerWeek === 0
    ) {
      flags.push('sedentary');
    }
    if (profile.smokingStatus === 'CURRENT') {
      flags.push('current_smoker');
    }
    if (profile.alcoholStatus === 'REGULAR') {
      flags.push('regular_alcohol_use');
    }

    return flags;
  }

  private toResponse(
    profile: Lifestyle,
  ): LifestyleAssessmentResponse {
    return {
      id: profile.id,
      userId: profile.userId,
      sleepHoursAvg: profile.sleepHoursAvg,
      stressLevel: profile.stressLevel,
      waterIntakeLitersAvg: profile.waterIntakeLitersAvg,
      smokingStatus: profile.smokingStatus,
      alcoholConsumption: profile.alcoholStatus,
      dietType: profile.dietType,
      exerciseFrequencyPerWeek: profile.exerciseFrequencyPerWeek,
      riskFlags: this.deriveRiskFlags(profile),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
