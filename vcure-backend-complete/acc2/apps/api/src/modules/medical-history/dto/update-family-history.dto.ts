import { PartialType } from '@nestjs/mapped-types';
import { CreateFamilyHistoryDto } from './create-family-history.dto';

export class UpdateFamilyHistoryDto extends PartialType(
  CreateFamilyHistoryDto,
) {}
