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

@Module({
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
    // Future modules register here:
    // NutritionModule, MedicalReportsModule, AiEngineModule, etc.
  ],
})
export class AppModule {}
