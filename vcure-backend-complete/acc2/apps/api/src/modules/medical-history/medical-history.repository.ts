import { Injectable } from '@nestjs/common';
import {
  Allergy,
  AllergyType,
  Disease,
  FamilyHistory,
  MedicalCondition,
  Medicine,
  Prisma,
} from '@prisma/client';
import { BaseRepository } from '../../database/base.repository';
import { PrismaTx } from '../../database/prisma-tx.type';

/**
 * Persistence for the Medical domain: conditions, medicines, allergies and
 * family history. One repository per domain (03 §47), not one per table.
 */
export type MedicalConditionWithDisease = MedicalCondition & {
  disease: { name: string };
};
export type AllergyWithType = Allergy & { allergyType: { name: string } };

@Injectable()
export class MedicalHistoryRepository extends BaseRepository {
  // --- Medical conditions ---
  findConditions(userId: string, tx?: PrismaTx): Promise<MedicalConditionWithDisease[]> {
    return this.db(tx).medicalCondition.findMany({
      where: { userId, deletedAt: null },
      include: { disease: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }) as Promise<MedicalConditionWithDisease[]>;
  }
  findConditionById(
    id: string,
    userId: string,
    tx?: PrismaTx,
  ): Promise<MedicalConditionWithDisease | null> {
    return this.db(tx).medicalCondition.findFirst({
      where: { id, userId, deletedAt: null },
      include: { disease: { select: { name: true } } },
    }) as Promise<MedicalConditionWithDisease | null>;
  }

  /** Resolves ACC1's free-text condition name against the curated Disease master. */
  findDiseaseByName(name: string, tx?: PrismaTx): Promise<Disease | null> {
    return this.db(tx).disease.findFirst({ where: { name, deletedAt: null } });
  }

  /** Resolves ACC1's free-text allergen against the curated AllergyType master. */
  findAllergyTypeByName(name: string, tx?: PrismaTx): Promise<AllergyType | null> {
    return this.db(tx).allergyType.findFirst({ where: { name, deletedAt: null } });
  }
  createCondition(
    data: Prisma.MedicalConditionUncheckedCreateInput,
    tx?: PrismaTx,
  ): Promise<MedicalConditionWithDisease> {
    return this.db(tx).medicalCondition.create({
      data,
      include: { disease: { select: { name: true } } },
    }) as Promise<MedicalConditionWithDisease>;
  }
  updateCondition(
    id: string,
    data: Prisma.MedicalConditionUncheckedUpdateInput,
    tx?: PrismaTx,
  ): Promise<MedicalConditionWithDisease> {
    return this.db(tx).medicalCondition.update({
      where: { id },
      data,
      include: { disease: { select: { name: true } } },
    }) as Promise<MedicalConditionWithDisease>;
  }

  // --- Medicines ---
  findMedicines(userId: string, tx?: PrismaTx): Promise<Medicine[]> {
    return this.db(tx).medicine.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
  findMedicineById(id: string, userId: string, tx?: PrismaTx): Promise<Medicine | null> {
    return this.db(tx).medicine.findFirst({ where: { id, userId, deletedAt: null } });
  }
  createMedicine(data: Prisma.MedicineUncheckedCreateInput, tx?: PrismaTx): Promise<Medicine> {
    return this.db(tx).medicine.create({ data });
  }
  updateMedicine(id: string, data: Prisma.MedicineUncheckedUpdateInput, tx?: PrismaTx): Promise<Medicine> {
    return this.db(tx).medicine.update({ where: { id }, data });
  }

  // --- Allergies ---
  findAllergies(userId: string, tx?: PrismaTx): Promise<AllergyWithType[]> {
    return this.db(tx).allergy.findMany({
      where: { userId, deletedAt: null },
      include: { allergyType: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }) as Promise<AllergyWithType[]>;
  }
  findAllergyById(
    id: string,
    userId: string,
    tx?: PrismaTx,
  ): Promise<AllergyWithType | null> {
    return this.db(tx).allergy.findFirst({
      where: { id, userId, deletedAt: null },
      include: { allergyType: { select: { name: true } } },
    }) as Promise<AllergyWithType | null>;
  }
  createAllergy(
    data: Prisma.AllergyUncheckedCreateInput,
    tx?: PrismaTx,
  ): Promise<AllergyWithType> {
    return this.db(tx).allergy.create({
      data,
      include: { allergyType: { select: { name: true } } },
    }) as Promise<AllergyWithType>;
  }
  updateAllergy(
    id: string,
    data: Prisma.AllergyUncheckedUpdateInput,
    tx?: PrismaTx,
  ): Promise<AllergyWithType> {
    return this.db(tx).allergy.update({
      where: { id },
      data,
      include: { allergyType: { select: { name: true } } },
    }) as Promise<AllergyWithType>;
  }

  // --- Family history ---
  findFamilyHistory(userId: string, tx?: PrismaTx): Promise<FamilyHistory[]> {
    return this.db(tx).familyHistory.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
  findFamilyHistoryById(id: string, userId: string, tx?: PrismaTx): Promise<FamilyHistory | null> {
    return this.db(tx).familyHistory.findFirst({ where: { id, userId, deletedAt: null } });
  }
  createFamilyHistory(data: Prisma.FamilyHistoryUncheckedCreateInput, tx?: PrismaTx): Promise<FamilyHistory> {
    return this.db(tx).familyHistory.create({ data });
  }
  updateFamilyHistory(id: string, data: Prisma.FamilyHistoryUncheckedUpdateInput, tx?: PrismaTx): Promise<FamilyHistory> {
    return this.db(tx).familyHistory.update({ where: { id }, data });
  }
}
