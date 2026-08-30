import { DiseaseSeverity, ConditionStatus } from '@prisma/client';

export interface MedicalConditionResponse {
  id: string;
  name: string;
  /** API field name per ACC1; sourced from MedicalCondition.diagnosedAt. */
  diagnosedDate: Date | null;
  status: ConditionStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicineResponse {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedFor: string | null;
  startedAt: Date | null;
  /** API field name per ACC1 medicineSchema; sourced from Medicine.isActive. */
  isOngoing: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AllergyResponse {
  id: string;
  allergen: string;
  severity: DiseaseSeverity;
  reaction: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyHistoryResponse {
  id: string;
  relation: string;
  condition: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
