import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  Allergy,
  FamilyHistory,
  MedicalCondition,
  Medicine,
} from '@prisma/client';
import {
  AllergyWithType,
  MedicalConditionWithDisease,
  MedicalHistoryRepository,
} from './medical-history.repository';
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
  constructor(private readonly repository: MedicalHistoryRepository) {}

  // ---------------------------------------------------------------------
  // MEDICAL CONDITIONS
  // ---------------------------------------------------------------------

  async listConditions(userId: string): Promise<MedicalConditionResponse[]> {
    const rows = await this.repository.findConditions(userId);
    return rows.map(this.toConditionResponse);
  }

  async createCondition(
    userId: string,
    dto: CreateMedicalConditionDto,
  ): Promise<MedicalConditionResponse> {
    const disease = await this.requireDisease(dto.name);
    const created = await this.repository.createCondition({
      userId,
      diseaseId: disease.id,
      // ACC3 requires a severity; ACC1's create contract does not send one.
      severity: 'MODERATE',
      diagnosedAt: dto.diagnosedDate ? new Date(dto.diagnosedDate) : null,
      status: dto.status ?? 'ACTIVE',
      isActive: (dto.status ?? 'ACTIVE') !== 'RESOLVED',
      notes: dto.notes,
    });
    return this.toConditionResponse(created);
  }

  async updateCondition(
    userId: string,
    id: string,
    dto: UpdateMedicalConditionDto,
  ): Promise<MedicalConditionResponse> {
    const existing = await this.findOwnedConditionOrThrow(userId, id);
    const disease = dto.name ? await this.requireDisease(dto.name) : null;
    const nextStatus = dto.status ?? existing.status;
    const updated = await this.repository.updateCondition(id, {
      ...(disease ? { diseaseId: disease.id } : {}),
      diagnosedAt: dto.diagnosedDate
        ? new Date(dto.diagnosedDate)
        : existing.diagnosedAt,
      status: nextStatus,
      isActive: nextStatus !== 'RESOLVED',
      notes: dto.notes ?? existing.notes,
    });
    return this.toConditionResponse(updated);
  }

  async deleteCondition(userId: string, id: string): Promise<void> {
    await this.findOwnedConditionOrThrow(userId, id);
    await this.repository.updateCondition(id, { deletedAt: new Date() });
  }

  /**
   * ACC3 canonicalises conditions against the curated `Disease` master that the
   * Safety Engine reads (including its isCritical kidney/liver flags). ACC1
   * sends a free-text name, so it is resolved by name — an unknown name is
   * rejected rather than creating an uncatalogued Disease row.
   */
  private async requireDisease(name: string) {
    const disease = await this.repository.findDiseaseByName(name);
    if (!disease) {
      throw new UnprocessableEntityException(
        `Unknown medical condition "${name}". It must exist in the curated disease catalogue.`,
      );
    }
    return disease;
  }

  /** Same rule for allergens against the curated `AllergyType` master. */
  private async requireAllergyType(name: string) {
    const type = await this.repository.findAllergyTypeByName(name);
    if (!type) {
      throw new UnprocessableEntityException(
        `Unknown allergen "${name}". It must exist in the curated allergy-type catalogue.`,
      );
    }
    return type;
  }

  private async findOwnedConditionOrThrow(
    userId: string,
    id: string,
  ): Promise<MedicalConditionWithDisease> {
    const record = await this.repository.findConditionById(id, userId);
    if (!record) {
      throw new NotFoundException('Medical condition not found');
    }
    return record;
  }

  private toConditionResponse(
    record: MedicalConditionWithDisease,
  ): MedicalConditionResponse {
    return {
      id: record.id,
      name: record.disease.name,
      diagnosedDate: record.diagnosedAt,
      status: record.status,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  // ---------------------------------------------------------------------
  // MEDICINES
  // ---------------------------------------------------------------------

  async listMedicines(userId: string): Promise<MedicineResponse[]> {
    const rows = await this.repository.findMedicines(userId);
    return rows.map(this.toMedicineResponse);
  }

  async createMedicine(
    userId: string,
    dto: CreateMedicineDto,
  ): Promise<MedicineResponse> {
    const created = await this.repository.createMedicine({
        userId,
        name: dto.name,
        dosage: dto.dosage,
        frequency: dto.frequency,
        prescribedFor: dto.prescribedFor,
        startDate: dto.startedAt ? new Date(dto.startedAt) : null,
        isActive: dto.isOngoing ?? true,});
    return this.toMedicineResponse(created);
  }

  async updateMedicine(
    userId: string,
    id: string,
    dto: UpdateMedicineDto,
  ): Promise<MedicineResponse> {
    const existing = await this.findOwnedMedicineOrThrow(userId, id);
    const updated = await this.repository.updateMedicine(id, {
      name: dto.name ?? existing.name,
      dosage: dto.dosage ?? existing.dosage,
      frequency: dto.frequency ?? existing.frequency,
      prescribedFor: dto.prescribedFor ?? existing.prescribedFor,
      startDate: dto.startedAt ? new Date(dto.startedAt) : existing.startDate,
      isActive: dto.isOngoing ?? existing.isActive,
    });
    return this.toMedicineResponse(updated);
  }

  async deleteMedicine(userId: string, id: string): Promise<void> {
    await this.findOwnedMedicineOrThrow(userId, id);
    await this.repository.updateMedicine(id, { deletedAt: new Date() });
  }

  private async findOwnedMedicineOrThrow(
    userId: string,
    id: string,
  ): Promise<Medicine> {
    const record = await this.repository.findMedicineById(id, userId);
    if (!record) {
      throw new NotFoundException('Medicine not found');
    }
    return record;
  }

  private toMedicineResponse(record: Medicine): MedicineResponse {
    return {
      id: record.id,
      name: record.name,
      // ACC3 canonicalises dosage/frequency as optional; the ACC1 contract
      // requires strings and its create DTO mandates them, so ACC3-authored
      // rows lacking them surface as empty rather than fabricated values.
      dosage: record.dosage ?? '',
      frequency: record.frequency ?? '',
      prescribedFor: record.prescribedFor,
      startedAt: record.startDate,
      isOngoing: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  // ---------------------------------------------------------------------
  // ALLERGIES
  // ---------------------------------------------------------------------

  async listAllergies(userId: string): Promise<AllergyResponse[]> {
    const rows = await this.repository.findAllergies(userId);
    return rows.map(this.toAllergyResponse);
  }

  async createAllergy(
    userId: string,
    dto: CreateAllergyDto,
  ): Promise<AllergyResponse> {
    const allergyType = await this.requireAllergyType(dto.allergen);
    const created = await this.repository.createAllergy({
      userId,
      allergyTypeId: allergyType.id,
      severity: dto.severity ?? 'MODERATE',
      reaction: dto.reaction,
    });
    return this.toAllergyResponse(created);
  }

  async updateAllergy(
    userId: string,
    id: string,
    dto: UpdateAllergyDto,
  ): Promise<AllergyResponse> {
    const existing = await this.findOwnedAllergyOrThrow(userId, id);
    const allergyType = dto.allergen
      ? await this.requireAllergyType(dto.allergen)
      : null;
    const updated = await this.repository.updateAllergy(id, {
      ...(allergyType ? { allergyTypeId: allergyType.id } : {}),
      severity: dto.severity ?? existing.severity,
      reaction: dto.reaction ?? existing.reaction,
    });
    return this.toAllergyResponse(updated);
  }

  async deleteAllergy(userId: string, id: string): Promise<void> {
    await this.findOwnedAllergyOrThrow(userId, id);
    await this.repository.updateAllergy(id, { deletedAt: new Date() });
  }

  private async findOwnedAllergyOrThrow(
    userId: string,
    id: string,
  ): Promise<AllergyWithType> {
    const record = await this.repository.findAllergyById(id, userId);
    if (!record) {
      throw new NotFoundException('Allergy not found');
    }
    return record;
  }

  private toAllergyResponse(record: AllergyWithType): AllergyResponse {
    return {
      id: record.id,
      // ACC3 canonicalises the allergen as a curated AllergyType the Safety
      // Engine reads; ACC1 expects its name.
      allergen: record.allergyType.name,
      severity: record.severity,
      reaction: record.reaction,
      // ACC3's Allergy has no isActive column; a non-deleted allergy is active.
      isActive: record.deletedAt === null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  // ---------------------------------------------------------------------
  // FAMILY HISTORY
  // ---------------------------------------------------------------------

  async listFamilyHistory(userId: string): Promise<FamilyHistoryResponse[]> {
    const rows = await this.repository.findFamilyHistory(userId);
    return rows.map(this.toFamilyHistoryResponse);
  }

  async createFamilyHistory(
    userId: string,
    dto: CreateFamilyHistoryDto,
  ): Promise<FamilyHistoryResponse> {
    const created = await this.repository.createFamilyHistory({
      userId,
      relation: dto.relation,
      condition: dto.condition,
      notes: dto.notes,
    });
    return this.toFamilyHistoryResponse(created);
  }

  async updateFamilyHistory(
    userId: string,
    id: string,
    dto: UpdateFamilyHistoryDto,
  ): Promise<FamilyHistoryResponse> {
    const existing = await this.findOwnedFamilyHistoryOrThrow(userId, id);
    const updated = await this.repository.updateFamilyHistory(id, {
      relation: dto.relation ?? existing.relation,
      condition: dto.condition ?? existing.condition,
      notes: dto.notes ?? existing.notes,
    });
    return this.toFamilyHistoryResponse(updated);
  }

  async deleteFamilyHistory(userId: string, id: string): Promise<void> {
    await this.findOwnedFamilyHistoryOrThrow(userId, id);
    await this.repository.updateFamilyHistory(id, { deletedAt: new Date() });
  }

  private async findOwnedFamilyHistoryOrThrow(
    userId: string,
    id: string,
  ): Promise<FamilyHistory> {
    const record = await this.repository.findFamilyHistoryById(id, userId);
    if (!record) {
      throw new NotFoundException('Family history entry not found');
    }
    return record;
  }

  private toFamilyHistoryResponse(
    record: FamilyHistory,
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
