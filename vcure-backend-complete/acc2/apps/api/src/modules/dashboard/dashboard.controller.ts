import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth-tokens.type';
import { DashboardSummary } from './types/dashboard.type';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getSummary(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DashboardSummary> {
    return this.dashboardService.getSummary(user.id);
  }
}
