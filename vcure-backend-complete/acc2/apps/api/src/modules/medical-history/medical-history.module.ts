import { Module } from '@nestjs/common';
import { MedicalHistoryController } from './medical-history.controller';
import { MedicalHistoryService } from './medical-history.service';
import { MedicalHistoryRepository } from './medical-history.repository';

@Module({
  controllers: [MedicalHistoryController],
  providers: [MedicalHistoryService, MedicalHistoryRepository],
  exports: [MedicalHistoryRepository, MedicalHistoryService],
})
export class MedicalHistoryModule {}
