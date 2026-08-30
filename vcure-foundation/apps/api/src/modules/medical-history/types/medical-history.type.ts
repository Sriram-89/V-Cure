import { AllergySeverity } from '@prisma/client';

export interface MedicalConditionResponse {
  id: string;
  name: string;
  diagnosedAt: Date | null;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicineResponse {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  prescribedFor: string | null;
  startedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AllergyResponse {
  id: string;
  allergen: string;
  severity: AllergySeverity;
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
