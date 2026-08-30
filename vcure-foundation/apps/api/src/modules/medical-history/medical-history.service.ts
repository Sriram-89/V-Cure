import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Allergy,
  FamilyHistoryEntry,
  MedicalCondition,
  Medicine,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMedicalConditionDto } from './dto/create-medical-condition.dto';
import { UpdateMedicalConditionDto } from './dto/update-medical-condition.dto';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';
import { CreateFamilyHistoryDto } from './dto/create-family-history.dto';
import { UpdateFamilyHistoryDto } from './dto/update-family-history.dto';
import {
  AllergyResponse,
  FamilyHistoryResponse,
  MedicalConditionResponse,
  MedicineResponse,
} from './types/medical-history.type';

@Injectable()
export class MedicalHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------
  // MEDICAL CONDITIONS
  // ---------------------------------------------------------------------

  async listConditions(userId: string): Promise<MedicalConditionResponse[]> {
    const rows = await this.prisma.medicalCondition.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(this.toConditionResponse);
  }

  async createCondition(
    userId: string,
    dto: CreateMedicalConditionDto,
  ): Promise<MedicalConditionResponse> {
    const created = await this.prisma.medicalCondition.create({
      data: {
        userId,
        name: dto.name,
        diagnosedAt: dto.diagnosedAt ? new Date(dto.diagnosedAt) : null,
        isActive: dto.isActive ?? true,
        notes: dto.notes,
      },
    });
    return this.toConditionResponse(created);
  }

  async updateCondition(
    userId: string,
    id: string,
    dto: UpdateMedicalConditionDto,
  ): Promise<MedicalConditionResponse> {
    const existing = await this.findOwnedConditionOrThrow(userId, id);
    const updated = await this.prisma.medicalCondition.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        diagnosedAt: dto.diagnosedAt
          ? new Date(dto.diagnosedAt)
          : existing.diagnosedAt,
        isActive: dto.isActive ?? existing.isActive,
        notes: dto.notes ?? existing.notes,
      },
    });
    return this.toConditionResponse(updated);
  }

  async deleteCondition(userId: string, id: string): Promise<void> {
    await this.findOwnedConditionOrThrow(userId, id);
    await this.prisma.medicalCondition.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async findOwnedConditionOrThrow(
    userId: string,
    id: string,
  ): Promise<MedicalCondition> {
    const record = await this.prisma.medicalCondition.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException('Medical condition not found');
    }
    return record;
  }

  private toConditionResponse(
    record: MedicalCondition,
  ): MedicalConditionResponse {
    return {
      id: record.id,
      name: record.name,
      diagnosedAt: record.diagnosedAt,
      isActive: record.isActive,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  // ---------------------------------------------------------------------
  // MEDICINES
  // ---------------------------------------------------------------------

  async listMedicines(userId: string): Promise<MedicineResponse[]> {
    const rows = await this.prisma.medicine.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(this.toMedicineResponse);
  }

  async createMedicine(
    userId: string,
    dto: CreateMedicineDto,
  ): Promise<MedicineResponse> {
    const created = await this.prisma.medicine.create({
      data: {
        userId,
        name: dto.name,
        dosage: dto.dosage,
        frequency: dto.frequency,
        prescribedFor: dto.prescribedFor,
        startedAt: dto.startedAt ? new Date(dto.startedAt) : null,
        isActive: dto.isActive ?? true,
      },
    });
    return this.toMedicineResponse(created);
  }

  async updateMedicine(
    userId: string,
    id: string,
    dto: UpdateMedicineDto,
  ): Promise<MedicineResponse> {
    const existing = await this.findOwnedMedicineOrThrow(userId, id);
    const updated = await this.prisma.medicine.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        dosage: dto.dosage ?? existing.dosage,
        frequency: dto.frequency ?? existing.frequency,
        prescribedFor: dto.prescribedFor ?? existing.prescribedFor,
        startedAt: dto.startedAt ? new Date(dto.startedAt) : existing.startedAt,
        isActive: dto.isActive ?? existing.isActive,
      },
    });
    return this.toMedicineResponse(updated);
  }

  async deleteMedicine(userId: string, id: string): Promise<void> {
    await this.findOwnedMedicineOrThrow(userId, id);
    await this.prisma.medicine.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async findOwnedMedicineOrThrow(
    userId: string,
    id: string,
  ): Promise<Medicine> {
    const record = await this.prisma.medicine.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException('Medicine not found');
    }
    return record;
  }

  private toMedicineResponse(record: Medicine): MedicineResponse {
    return {
      id: record.id,
      name: record.name,
      dosage: record.dosage,
      frequency: record.frequency,
      prescribedFor: record.prescribedFor,
      startedAt: record.startedAt,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  // ---------------------------------------------------------------------
  // ALLERGIES
  // ---------------------------------------------------------------------

  async listAllergies(userId: string): Promise<AllergyResponse[]> {
    const rows = await this.prisma.allergy.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(this.toAllergyResponse);
  }

  async createAllergy(
    userId: string,
    dto: CreateAllergyDto,
  ): Promise<AllergyResponse> {
    const created = await this.prisma.allergy.create({
      data: {
        userId,
        allergen: dto.allergen,
        severity: dto.severity ?? 'MODERATE',
        reaction: dto.reaction,
        isActive: dto.isActive ?? true,
      },
    });
    return this.toAllergyResponse(created);
  }

  async updateAllergy(
    userId: string,
    id: string,
    dto: UpdateAllergyDto,
  ): Promise<AllergyResponse> {
    const existing = await this.findOwnedAllergyOrThrow(userId, id);
    const updated = await this.prisma.allergy.update({
      where: { id },
      data: {
        allergen: dto.allergen ?? existing.allergen,
        severity: dto.severity ?? existing.severity,
        reaction: dto.reaction ?? existing.reaction,
        isActive: dto.isActive ?? existing.isActive,
      },
    });
    return this.toAllergyResponse(updated);
  }

  async deleteAllergy(userId: string, id: string): Promise<void> {
    await this.findOwnedAllergyOrThrow(userId, id);
    await this.prisma.allergy.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async findOwnedAllergyOrThrow(
    userId: string,
    id: string,
  ): Promise<Allergy> {
    const record = await this.prisma.allergy.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException('Allergy not found');
    }
    return record;
  }

  private toAllergyResponse(record: Allergy): AllergyResponse {
    return {
      id: record.id,
      allergen: record.allergen,
      severity: record.severity,
      reaction: record.reaction,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  // ---------------------------------------------------------------------
  // FAMILY HISTORY
  // ---------------------------------------------------------------------

  async listFamilyHistory(userId: string): Promise<FamilyHistoryResponse[]> {
    const rows = await this.prisma.familyHistoryEntry.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(this.toFamilyHistoryResponse);
  }

  async createFamilyHistory(
    userId: string,
    dto: CreateFamilyHistoryDto,
  ): Promise<FamilyHistoryResponse> {
    const created = await this.prisma.familyHistoryEntry.create({
      data: {
        userId,
        relation: dto.relation,
        condition: dto.condition,
        notes: dto.notes,
      },
    });
    return this.toFamilyHistoryResponse(created);
  }

  async updateFamilyHistory(
    userId: string,
    id: string,
    dto: UpdateFamilyHistoryDto,
  ): Promise<FamilyHistoryResponse> {
    const existing = await this.findOwnedFamilyHistoryOrThrow(userId, id);
    const updated = await this.prisma.familyHistoryEntry.update({
      where: { id },
      data: {
        relation: dto.relation ?? existing.relation,
        condition: dto.condition ?? existing.condition,
        notes: dto.notes ?? existing.notes,
      },
    });
    return this.toFamilyHistoryResponse(updated);
  }

  async deleteFamilyHistory(userId: string, id: string): Promise<void> {
    await this.findOwnedFamilyHistoryOrThrow(userId, id);
    await this.prisma.familyHistoryEntry.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async findOwnedFamilyHistoryOrThrow(
    userId: string,
    id: string,
  ): Promise<FamilyHistoryEntry> {
    const record = await this.prisma.familyHistoryEntry.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException('Family history entry not found');
    }
    return record;
  }

  private toFamilyHistoryResponse(
    record: FamilyHistoryEntry,
  ): FamilyHistoryResponse {
    return {
      id: record.id,
      relation: record.relation,
      condition: record.condition,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
