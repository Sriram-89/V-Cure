import type { EducationAdapter } from "@/lib/education-adapter/types";
import { mockEducationAdapter } from "@/lib/education-adapter/mock-adapter";

// TODO(backend): once /education/* endpoints exist in 05_API_CONTRACTS.md,
// implement a RealEducationAdapter against apiClient and swap it in here.
// No component or hook in src/components/education or src/hooks/use-education.ts
// should need to change.
export const educationAdapter: EducationAdapter = mockEducationAdapter;

export type { EducationAdapter } from "@/lib/education-adapter/types";
