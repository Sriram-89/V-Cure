import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { HealthProfileModule } from '../health-profile/health-profile.module';
import { LifestyleAssessmentModule } from '../lifestyle-assessment/lifestyle-assessment.module';
import { UsersModule } from '../users/users.module';
import { MedicalHistoryModule } from '../medical-history/medical-history.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    HealthProfileModule,
    LifestyleAssessmentModule,
    UsersModule,
    MedicalHistoryModule,
    AuthModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
