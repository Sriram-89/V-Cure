import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressRangeDto } from './dto/progress-range.dto';
import { LogWeightDto } from './dto/log-weight.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth-tokens.type';
import { BmiEntry, WeightEntry } from './types/progress.type';

/**
 * Progress operations that are backed by an existing model.
 *
 * Eight of ACC1's eleven operations are intentionally absent — see
 * PROGRESS-BLOCKED in the report. They need Tracking models that do not
 * exist, or health-score/calorie algorithms that no authoritative source
 * defines. None was stubbed.
 */
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('weight')
  getWeightHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() dto: ProgressRangeDto,
  ): Promise<WeightEntry[]> {
    return this.progressService.getWeightHistory(user.id, dto.range);
  }

  @Get('bmi')
  getBmiHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() dto: ProgressRangeDto,
  ): Promise<BmiEntry[]> {
    return this.progressService.getBmiHistory(user.id, dto.range);
  }

  @Post('weight')
  logWeightEntry(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LogWeightDto,
  ): Promise<WeightEntry> {
    return this.progressService.logWeightEntry(user.id, dto);
  }
}
