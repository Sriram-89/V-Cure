import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { MedicalHistoryService } from './medical-history.service';
import { CreateMedicalConditionDto } from './dto/create-medical-condition.dto';
import { UpdateMedicalConditionDto } from './dto/update-medical-condition.dto';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';
import { CreateFamilyHistoryDto } from './dto/create-family-history.dto';
import { UpdateFamilyHistoryDto } from './dto/update-family-history.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/auth-tokens.type';
import {
  AllergyResponse,
  FamilyHistoryResponse,
  MedicalConditionResponse,
  MedicineResponse,
} from './types/medical-history.type';

@Controller('medical-history')
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  // --- Medical conditions ---

  @Get('conditions')
  async listConditions(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MedicalConditionResponse[]> {
    return this.medicalHistoryService.listConditions(user.id);
  }

  @Post('conditions')
  async createCondition(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMedicalConditionDto,
  ): Promise<MedicalConditionResponse> {
    return this.medicalHistoryService.createCondition(user.id, dto);
  }

  @Patch('conditions/:id')
  async updateCondition(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateMedicalConditionDto,
  ): Promise<MedicalConditionResponse> {
    return this.medicalHistoryService.updateCondition(user.id, id, dto);
  }

  @Delete('conditions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCondition(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.medicalHistoryService.deleteCondition(user.id, id);
  }

  // --- Medicines ---

  @Get('medicines')
  async listMedicines(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MedicineResponse[]> {
    return this.medicalHistoryService.listMedicines(user.id);
  }

  @Post('medicines')
  async createMedicine(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMedicineDto,
  ): Promise<MedicineResponse> {
    return this.medicalHistoryService.createMedicine(user.id, dto);
  }

  @Patch('medicines/:id')
  async updateMedicine(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateMedicineDto,
  ): Promise<MedicineResponse> {
    return this.medicalHistoryService.updateMedicine(user.id, id, dto);
  }

  @Delete('medicines/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMedicine(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.medicalHistoryService.deleteMedicine(user.id, id);
  }

  // --- Allergies ---

  @Get('allergies')
  async listAllergies(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AllergyResponse[]> {
    return this.medicalHistoryService.listAllergies(user.id);
  }

  @Post('allergies')
  async createAllergy(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAllergyDto,
  ): Promise<AllergyResponse> {
    return this.medicalHistoryService.createAllergy(user.id, dto);
  }

  @Patch('allergies/:id')
  async updateAllergy(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateAllergyDto,
  ): Promise<AllergyResponse> {
    return this.medicalHistoryService.updateAllergy(user.id, id, dto);
  }

  @Delete('allergies/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllergy(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.medicalHistoryService.deleteAllergy(user.id, id);
  }

  // --- Family history ---

  @Get('family-history')
  async listFamilyHistory(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FamilyHistoryResponse[]> {
    return this.medicalHistoryService.listFamilyHistory(user.id);
  }

  @Post('family-history')
  async createFamilyHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFamilyHistoryDto,
  ): Promise<FamilyHistoryResponse> {
    return this.medicalHistoryService.createFamilyHistory(user.id, dto);
  }

  @Patch('family-history/:id')
  async updateFamilyHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateFamilyHistoryDto,
  ): Promise<FamilyHistoryResponse> {
    return this.medicalHistoryService.updateFamilyHistory(user.id, id, dto);
  }

  @Delete('family-history/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFamilyHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.medicalHistoryService.deleteFamilyHistory(user.id, id);
  }
}
