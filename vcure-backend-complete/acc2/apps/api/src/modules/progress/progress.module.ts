import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { HealthProfileModule } from '../health-profile/health-profile.module';

@Module({
  imports: [HealthProfileModule],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
