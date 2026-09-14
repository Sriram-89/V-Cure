import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthProfileModule } from './modules/health-profile/health-profile.module';
import { LifestyleAssessmentModule } from './modules/lifestyle-assessment/lifestyle-assessment.module';
import { MedicalHistoryModule } from './modules/medical-history/medical-history.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdminModule } from './modules/admin/admin.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ProgressModule } from './modules/progress/progress.module';
import { EducationModule } from './modules/education/education.module';
import { RecipeModule } from './modules/recipe/recipe.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { AIFoundationModule } from 'vcure-backend';
import { AiFoundationController } from './modules/ai/ai-foundation.controller';

@Module({
  controllers: [AiFoundationController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    HealthProfileModule,
    LifestyleAssessmentModule,
    MedicalHistoryModule,
    OnboardingModule,
    DashboardModule,
    NotificationModule,
    AdminModule,
    SettingsModule,
    ProgressModule,
    EducationModule,
    RecipeModule,
    TrackingModule,
    NutritionModule,
    AIFoundationModule,
    // Future modules register here:
    // NutritionModule, MedicalReportsModule, AiEngineModule, etc.
  ],
})
export class AppModule {}
