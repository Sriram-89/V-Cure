import { Injectable, NotFoundException } from '@nestjs/common';
import { LifestyleAssessment, LifestyleAssessmentHistory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateLifestyleAssessmentDto } from './dto/update-lifestyle-assessment.dto';
import {
  LifestyleAssessmentResponse,
  LifestyleAssessmentTrendPoint,
} from './types/lifestyle-assessment.type';

@Injectable()
export class LifestyleAssessmentService {
  constructor(private readonly prisma: PrismaService) {}

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
   * trend snapshot to LifestyleAssessmentHistory (sleep/stress/water/
   * exercise history feeds the daily recommendation engine later).
   */
  async upsertMyAssessment(
    userId: string,
    dto: UpdateLifestyleAssessmentDto,
  ): Promise<LifestyleAssessmentResponse> {
    const existing = await this.findActive(userId);

    const data = {
      workingHoursPerDay:
        dto.workingHoursPerDay ?? existing?.workingHoursPerDay ?? null,
      sleepHoursAvg: dto.sleepHoursAvg ?? existing?.sleepHoursAvg ?? null,
      sleepQuality: dto.sleepQuality ?? existing?.sleepQuality ?? null,
      stressLevel: dto.stressLevel ?? existing?.stressLevel ?? null,
      waterIntakeLitersAvg:
        dto.waterIntakeLitersAvg ?? existing?.waterIntakeLitersAvg ?? null,
      smokingStatus:
        dto.smokingStatus ?? existing?.smokingStatus ?? 'NEVER',
      alcoholStatus:
        dto.alcoholStatus ?? existing?.alcoholStatus ?? 'NEVER',
      exerciseFrequencyPerWeek:
        dto.exerciseFrequencyPerWeek ??
        existing?.exerciseFrequencyPerWeek ??
        null,
      mealTimingNotes: dto.mealTimingNotes ?? existing?.mealTimingNotes ?? null,
    } as const;

    const saved = existing
      ? await this.prisma.lifestyleAssessment.update({
          where: { id: existing.id },
          data,
        })
      : await this.prisma.lifestyleAssessment.create({
          data: { userId, ...data },
        });

    await this.prisma.lifestyleAssessmentHistory.create({
      data: {
        lifestyleAssessmentId: saved.id,
        workingHoursPerDay: saved.workingHoursPerDay,
        sleepHoursAvg: saved.sleepHoursAvg,
        sleepQuality: saved.sleepQuality,
        stressLevel: saved.stressLevel,
        waterIntakeLitersAvg: saved.waterIntakeLitersAvg,
        smokingStatus: saved.smokingStatus,
        alcoholStatus: saved.alcoholStatus,
        exerciseFrequencyPerWeek: saved.exerciseFrequencyPerWeek,
        mealTimingNotes: saved.mealTimingNotes,
      },
    });

    return this.toResponse(saved);
  }

  async getTrends(userId: string): Promise<LifestyleAssessmentTrendPoint[]> {
    const assessment = await this.findActive(userId);
    if (!assessment) {
      throw new NotFoundException('Lifestyle assessment not found');
    }

    const history = await this.prisma.lifestyleAssessmentHistory.findMany({
      where: { lifestyleAssessmentId: assessment.id },
      orderBy: { recordedAt: 'asc' },
    });

    return history.map((entry: LifestyleAssessmentHistory) => ({
      id: entry.id,
      workingHoursPerDay: entry.workingHoursPerDay,
      sleepHoursAvg: entry.sleepHoursAvg,
      sleepQuality: entry.sleepQuality,
      stressLevel: entry.stressLevel,
      waterIntakeLitersAvg: entry.waterIntakeLitersAvg,
      smokingStatus: entry.smokingStatus,
      alcoholStatus: entry.alcoholStatus,
      exerciseFrequencyPerWeek: entry.exerciseFrequencyPerWeek,
      recordedAt: entry.recordedAt,
    }));
  }

  private async findActive(
    userId: string,
  ): Promise<LifestyleAssessment | null> {
    return this.prisma.lifestyleAssessment.findFirst({
      where: { userId, deletedAt: null },
    });
  }

  /**
   * Purely descriptive, threshold-based tags on self-reported lifestyle
   * data (e.g. "low_sleep", "sedentary"). These are NOT medical
   * assessments or diagnoses — they only flag inputs the future
   * recommendation engine should weigh more carefully. Never surfaced
   * as health advice by this module.
   */
  private deriveRiskFlags(profile: LifestyleAssessment): string[] {
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
    profile: LifestyleAssessment,
  ): LifestyleAssessmentResponse {
    return {
      id: profile.id,
      userId: profile.userId,
      workingHoursPerDay: profile.workingHoursPerDay,
      sleepHoursAvg: profile.sleepHoursAvg,
      sleepQuality: profile.sleepQuality,
      stressLevel: profile.stressLevel,
      waterIntakeLitersAvg: profile.waterIntakeLitersAvg,
      smokingStatus: profile.smokingStatus,
      alcoholStatus: profile.alcoholStatus,
      exerciseFrequencyPerWeek: profile.exerciseFrequencyPerWeek,
      mealTimingNotes: profile.mealTimingNotes,
      riskFlags: this.deriveRiskFlags(profile),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
