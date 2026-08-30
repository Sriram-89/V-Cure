import { PartialType } from '@nestjs/mapped-types';
import { CreateLifestyleAssessmentDto } from './create-lifestyle-assessment.dto';

export class UpdateLifestyleAssessmentDto extends PartialType(
  CreateLifestyleAssessmentDto,
) {}
