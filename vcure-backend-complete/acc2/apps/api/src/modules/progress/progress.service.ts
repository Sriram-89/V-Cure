import { Injectable } from '@nestjs/common';
import { HealthProfileRepository } from '../health-profile/health-profile.repository';
import { HealthProfileService } from '../health-profile/health-profile.service';
import { DateRangePreset, BmiEntry, WeightEntry } from './types/progress.type';
import { LogWeightDto } from './dto/log-weight.dto';

const RANGE_DAYS: Record<DateRangePreset, number> = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
  '1Y': 365,
};

@Injectable()
export class ProgressService {
  constructor(
    private readonly healthProfileRepository: HealthProfileRepository,
    private readonly healthProfileService: HealthProfileService,
  ) {}

  /** ACC1 `getWeightHistory(range)`. Sourced from HealthProfileHistory. */
  async getWeightHistory(
    userId: string,
    range: DateRangePreset,
  ): Promise<WeightEntry[]> {
    const rows = await this.healthProfileRepository.findHistorySince(
      userId,
      this.cutoffFor(range),
    );
    return rows.map((r) => ({
      date: r.recordedAt.toISOString(),
      weightKg: r.weightKg,
    }));
  }

  /**
   * ACC1 `getBmiHistory(range)`.
   *
   * BMI values are read from stored history — never recomputed here — and the
   * category comes from HealthProfileService, so the clinical thresholds stay
   * in exactly one place (D-5 / RISK-3).
   */
  async getBmiHistory(
    userId: string,
    range: DateRangePreset,
  ): Promise<BmiEntry[]> {
    const rows = await this.healthProfileRepository.findHistorySince(
      userId,
      this.cutoffFor(range),
    );
    return rows.map((r) => ({
      date: r.recordedAt.toISOString(),
      bmi: r.bmi,
      category: this.healthProfileService.categorizeBmi(r.bmi),
    }));
  }

  /**
   * ACC1 `logWeightEntry(weightKg)`.
   *
   * Delegates to HealthProfileService.upsertMyHealthProfile so BMI
   * recalculation and history writing follow the single existing code path —
   * no duplicated weight, BMI or history logic.
   */
  async logWeightEntry(
    userId: string,
    dto: LogWeightDto,
  ): Promise<WeightEntry> {
    const updated = await this.healthProfileService.upsertMyHealthProfile(
      userId,
      { weightKg: dto.weightKg },
    );
    return {
      date: updated.updatedAt.toISOString(),
      weightKg: updated.weightKg,
    };
  }

  private cutoffFor(range: DateRangePreset): Date {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RANGE_DAYS[range]);
    return cutoff;
  }
}
