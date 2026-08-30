import { Body, Controller, Get, Patch } from '@nestjs/common';
import { HealthProfileService } from './health-profile.service';
import { UpdateGoalsDto } from './dto/update-goals.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth-tokens.type';
import { HealthGoalResponse } from './types/health-profile.type';

/**
 * ACC1 calls GET/PATCH /api/v1/goals. Goals live on HealthProfile, so this
 * controller reuses HealthProfileService rather than introducing a module.
 */
@Controller('goals')
export class GoalsController {
  constructor(private readonly healthProfileService: HealthProfileService) {}

  @Get()
  async getMyGoals(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HealthGoalResponse> {
    return this.healthProfileService.getMyGoals(user.id);
  }

  @Patch()
  async updateMyGoals(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateGoalsDto,
  ): Promise<HealthGoalResponse> {
    return this.healthProfileService.updateMyGoals(user.id, dto);
  }
}
