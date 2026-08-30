import { Module } from '@nestjs/common';
import { LifestyleAssessmentController } from './lifestyle-assessment.controller';
import { LifestyleAssessmentService } from './lifestyle-assessment.service';
import { LifestyleAssessmentRepository } from './lifestyle-assessment.repository';

@Module({
  controllers: [LifestyleAssessmentController],
  providers: [LifestyleAssessmentService, LifestyleAssessmentRepository],
  exports: [LifestyleAssessmentService, LifestyleAssessmentRepository],
})
export class LifestyleAssessmentModule {}
