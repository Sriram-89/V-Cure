import { Controller, Get, Put, Body } from '@nestjs/common';
import { HealthProfileService } from './health-profile.service';
import { UpdateHealthProfileDto } from './dto/update-health-profile.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth-tokens.type';
import {
  HealthProfileResponse,
  HealthProfileTrendPoint,
} from './types/health-profile.type';

@Controller('health-profile')
export class HealthProfileController {
  constructor(private readonly healthProfileService: HealthProfileService) {}

  @Get()
  async getMyHealthProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HealthProfileResponse> {
    return this.healthProfileService.getMyHealthProfile(user.id);
  }

  @Put()
  async upsertMyHealthProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateHealthProfileDto,
  ): Promise<HealthProfileResponse> {
    return this.healthProfileService.upsertMyHealthProfile(user.id, dto);
  }

  @Get('trends')
  async getTrends(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HealthProfileTrendPoint[]> {
    return this.healthProfileService.getTrends(user.id);
  }
}
