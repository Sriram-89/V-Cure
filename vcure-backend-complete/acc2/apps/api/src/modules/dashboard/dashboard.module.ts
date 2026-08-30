import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { HealthProfileModule } from '../health-profile/health-profile.module';
import { LifestyleAssessmentModule } from '../lifestyle-assessment/lifestyle-assessment.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [HealthProfileModule, LifestyleAssessmentModule, UsersModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
