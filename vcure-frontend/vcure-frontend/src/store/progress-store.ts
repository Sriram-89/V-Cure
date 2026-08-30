import { create } from "zustand";
import type { DateRangePreset } from "@/types/progress";

interface ProgressStoreState {
  range: DateRangePreset;
  setRange: (range: DateRangePreset) => void;
}

export const useProgressStore = create<ProgressStoreState>()((set) => ({
  range: "30D",
  setRange: (range) => set({ range })
}));
