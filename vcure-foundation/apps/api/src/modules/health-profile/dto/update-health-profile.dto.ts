import { PartialType } from '@nestjs/mapped-types';
import { CreateHealthProfileDto } from './create-health-profile.dto';

export class UpdateHealthProfileDto extends PartialType(
  CreateHealthProfileDto,
) {}
