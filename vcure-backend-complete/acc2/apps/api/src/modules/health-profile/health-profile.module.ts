import { Module } from '@nestjs/common';
import { HealthProfileController } from './health-profile.controller';
import { GoalsController } from './goals.controller';
import { HealthProfileService } from './health-profile.service';
import { HealthProfileRepository } from './health-profile.repository';

@Module({
  controllers: [HealthProfileController, GoalsController],
  providers: [HealthProfileService, HealthProfileRepository],
  exports: [HealthProfileService, HealthProfileRepository],
})
export class HealthProfileModule {}
