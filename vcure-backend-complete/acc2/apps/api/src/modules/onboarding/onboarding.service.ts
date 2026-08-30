import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { HealthProfileRepository } from '../health-profile/health-profile.repository';
import { LifestyleAssessmentRepository } from '../lifestyle-assessment/lifestyle-assessment.repository';
import { MedicalHistoryRepository } from '../medical-history/medical-history.repository';
import { AuthRepository } from '../auth/auth.repository';
import { HealthProfileService } from '../health-profile/health-profile.service';
import { LifestyleAssessmentService } from '../lifestyle-assessment/lifestyle-assessment.service';
import { OnboardingCompleteDto } from './dto/onboarding-complete.dto';
import { OnboardingCompleteResponse } from './types/onboarding.type';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly healthProfileRepository: HealthProfileRepository,
    private readonly lifestyleRepository: LifestyleAssessmentRepository,
    private readonly medicalHistoryRepository: MedicalHistoryRepository,
    private readonly authRepository: AuthRepository,
    private readonly healthProfileService: HealthProfileService,
    private readonly lifestyleService: LifestyleAssessmentService,
  ) {}

  /**
   * Completes onboarding in a single transaction (03 §54: registration and
   * health-profile creation must be transactional — if one write fails,
   * everything rolls back).
   *
   * Clinical logic is NOT reimplemented here: BMI comes from
   * HealthProfileService and risk flags from LifestyleAssessmentService, so
   * there is exactly one source for each.
   */
  async complete(
    userId: string,
    dto: OnboardingCompleteDto,
  ): Promise<OnboardingCompleteResponse> {
    // CONFLICT-2: ACC1's onboarding payload supplies medication NAMES only,
    // but Medicine.dosage and Medicine.frequency are required (aligned in
    // Phase 4 to ACC1's own medicineSchema, which mandates both). The two ACC1
    // contracts disagree. Rejecting loudly rather than inventing a dosage or
    // silently discarding the user's medication list.
    if (dto.medicalProfile.medications.length > 0) {
      throw new UnprocessableEntityException(
        'Medications cannot be saved during onboarding: dosage and frequency ' +
          'are required for each medicine, and the onboarding payload supplies ' +
          'names only. Add medicines via POST /medical-history/medicines. ' +
          '(Unresolved contract conflict CONFLICT-2.)',
      );
    }

    const existingProfile = await this.usersRepository.findActiveProfile(userId);

    // CONFLICT-1: UserProfile.fullName is required, and ACC1's PersonalInfoDto
    // does not send it. A profile must therefore already exist. Not inventing
    // a name derived from the email or Firebase token.
    if (!existingProfile) {
      throw new UnprocessableEntityException(
        'A user profile must exist before onboarding can complete: fullName is ' +
          'required and is not part of the onboarding payload. ' +
          '(Unresolved contract conflict CONFLICT-1.)',
      );
    }

    const bmi = this.healthProfileService.computeBmi(
      dto.healthProfile.heightCm,
      dto.healthProfile.weightKg,
    );

    await this.usersRepository.runInTransaction(async (tx) => {
      await this.usersRepository.updateProfile(
        existingProfile.id,
        {
          dateOfBirth: new Date(dto.personalInfo.dateOfBirth),
          gender: dto.personalInfo.gender,
          phoneNumber: dto.personalInfo.phone,
        },
        tx,
      );

      // Canonical HealthProfile requires age/gender/primaryGoal. Age and
      // gender come from the profile updated above; the goal goes through the
      // same F-11 mapping used by the goals endpoint — no assumed equivalence.
      const healthData = {
        age: this.healthProfileService.deriveAgeFrom(
          new Date(dto.personalInfo.dateOfBirth),
        ),
        gender: dto.personalInfo.gender,
        heightCm: dto.healthProfile.heightCm,
        weightKg: dto.healthProfile.weightKg,
        bloodGroup: dto.healthProfile.bloodGroup,
        bmi,
        activityLevel: dto.lifestyle.activityLevel,
        primaryGoal: this.healthProfileService.toCanonicalGoalPublic(
          dto.goals.primaryGoal,
        ),
        goalTimeline: dto.goals.timeline,
        targetWeightKg: dto.goals.targetWeightKg ?? null,
      };
      await this.healthProfileRepository.upsertByUserId(
        userId,
        { userId, ...healthData },
        healthData,
        tx,
      );

      const lifestyleData = {
        sleepHoursAvg: dto.lifestyle.sleepHours,
        smokingStatus: dto.lifestyle.smokingStatus,
        alcoholConsumption: dto.lifestyle.alcoholConsumption,
        dietType: dto.lifestyle.dietType,
      };
      await this.lifestyleRepository.upsertByUserId(
        userId,
        { userId, ...lifestyleData },
        lifestyleData,
        tx,
      );

      // Conditions and allergens resolve against ACC3's curated masters, which
      // the Safety Engine reads. An uncatalogued value is rejected rather than
      // creating an uncatalogued Disease/AllergyType row.
      for (const name of dto.medicalProfile.conditions) {
        const disease = await this.medicalHistoryRepository.findDiseaseByName(
          name,
          tx,
        );
        if (!disease) {
          throw new UnprocessableEntityException(
            `Unknown medical condition "${name}". It must exist in the curated disease catalogue.`,
          );
        }
        await this.medicalHistoryRepository.createCondition(
          { userId, diseaseId: disease.id, severity: 'MODERATE' },
          tx,
        );
      }
      for (const allergen of dto.medicalProfile.allergies) {
        const allergyType =
          await this.medicalHistoryRepository.findAllergyTypeByName(allergen, tx);
        if (!allergyType) {
          throw new UnprocessableEntityException(
            `Unknown allergen "${allergen}". It must exist in the curated allergy-type catalogue.`,
          );
        }
        // Severity is NOT inferred here — see RISK-1.
        await this.medicalHistoryRepository.createAllergy(
          { userId, allergyTypeId: allergyType.id, severity: 'MODERATE' },
          tx,
        );
      }

      await this.authRepository.markOnboardingCompleted(userId, tx);
    });

    const riskFlags = await this.lifestyleService.getRiskFlags(userId);

    return { onboardingCompleted: true, bmi, riskFlags };
  }
}
