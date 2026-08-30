import { Body, Controller, Get, Put } from '@nestjs/common';
import { LifestyleAssessmentService } from './lifestyle-assessment.service';
import { UpdateLifestyleAssessmentDto } from './dto/update-lifestyle-assessment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth-tokens.type';
import {
  LifestyleAssessmentResponse,
  LifestyleAssessmentTrendPoint,
} from './types/lifestyle-assessment.type';

@Controller('lifestyle-assessment/me')
export class LifestyleAssessmentController {
  constructor(
    private readonly lifestyleAssessmentService: LifestyleAssessmentService,
  ) {}

  @Get()
  async getMyAssessment(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LifestyleAssessmentResponse> {
    return this.lifestyleAssessmentService.getMyAssessment(user.id);
  }

  @Put()
  async upsertMyAssessment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateLifestyleAssessmentDto,
  ): Promise<LifestyleAssessmentResponse> {
    return this.lifestyleAssessmentService.upsertMyAssessment(user.id, dto);
  }

  @Get('trends')
  async getTrends(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LifestyleAssessmentTrendPoint[]> {
    return this.lifestyleAssessmentService.getTrends(user.id);
  }
}
