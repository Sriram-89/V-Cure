import { Module } from '@nestjs/common';
import { LifestyleAssessmentController } from './lifestyle-assessment.controller';
import { LifestyleAssessmentService } from './lifestyle-assessment.service';

@Module({
  controllers: [LifestyleAssessmentController],
  providers: [LifestyleAssessmentService],
  exports: [LifestyleAssessmentService],
})
export class LifestyleAssessmentModule {}
