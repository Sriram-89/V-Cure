import { create } from "zustand";
import type { AdminContentType, AdminUserFilters } from "@/types/admin";

interface AdminStoreState {
  userFilters: AdminUserFilters;
  activeContentType: AdminContentType;
  setUserFilters: (filters: AdminUserFilters) => void;
  setActiveContentType: (type: AdminContentType) => void;
}

export const useAdminStore = create<AdminStoreState>()((set) => ({
  userFilters: { page: 1, pageSize: 10 },
  activeContentType: "FOOD",
  setUserFilters: (filters) => set({ userFilters: filters }),
  setActiveContentType: (type) => set({ activeContentType: type })
}));
