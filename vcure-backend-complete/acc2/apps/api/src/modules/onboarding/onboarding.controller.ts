import { Body, Controller, Post } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingCompleteDto } from './dto/onboarding-complete.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth-tokens.type';
import { OnboardingCompleteResponse } from './types/onboarding.type';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('complete')
  async complete(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: OnboardingCompleteDto,
  ): Promise<OnboardingCompleteResponse> {
    return this.onboardingService.complete(user.id, dto);
  }
}
