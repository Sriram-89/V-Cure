import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/api-client";

export type FamilyRelationship = "Dad" | "Mom" | "Spouse" | "Sister" | "Brother" | "Child" | "Friend" | "Other";
export type ConnectionStatus = "CONNECTED" | "PENDING" | "INVITED";

export interface FamilyConsentPermissions {
  shareWater: boolean;
  shareMeals: boolean;
  shareWeight: boolean;
  shareGlucose: boolean;
  shareBP: boolean;
  shareMedications: boolean;
  shareReports: boolean;
}

export interface FamilyMemberHealthData {
  waterMl?: number;
  waterGoalMl?: number;
  mealsEatenCount?: number;
  weightKg?: number;
  bmi?: number;
  bloodGlucoseMgDl?: number;
  hba1cPercent?: number;
  systolicBP?: number;
  diastolicBP?: number;
  conditions?: string[];
  medications?: string[];
  feverRecordedDaysAgo?: number;
  dietComplianceMonths?: number;
  hba1cTrendImproved?: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: FamilyRelationship;
  status: ConnectionStatus;
  permissions: FamilyConsentPermissions;
  healthData?: FamilyMemberHealthData;
}

interface FamilyState {
  members: FamilyMember[];
  addMember: (name: string, relationship: FamilyRelationship) => Promise<void>;
  updatePermissions: (id: string, permissions: Partial<FamilyConsentPermissions>) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
}

const initialFamilyMembers: FamilyMember[] = [];

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set) => ({
      members: initialFamilyMembers,

      addMember: async (name, relationship) => {
        const newMember: FamilyMember = {
          id: `fam-${Date.now()}`,
          name,
          relationship,
          status: "INVITED",
          permissions: {
            shareWater: false,
            shareMeals: false,
            shareWeight: false,
            shareGlucose: false,
            shareBP: false,
            shareMedications: false,
            shareReports: false
          }
        };

        set((state) => ({ members: [...state.members, newMember] }));

        try {
          await apiClient.post("/family/connections", { name, relationship });
        } catch {
          // Graceful local fallback
        }
      },

      updatePermissions: async (id, updatedPerms) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, permissions: { ...m.permissions, ...updatedPerms } } : m
          )
        }));

        try {
          await apiClient.patch(`/family/connections/${id}/permissions`, updatedPerms);
        } catch {
          // Graceful fallback
        }
      },

      removeMember: async (id) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id)
        }));

        try {
          await apiClient.delete(`/family/connections/${id}`);
        } catch {
          // Graceful fallback
        }
      }
    }),
    {
      name: "vcure-family-connections",
      partialize: (state) => ({ members: state.members })
    }
  )
);
