import type { ProgressAdapter } from "@/lib/progress-adapter/types";
import { mockProgressAdapter } from "@/lib/progress-adapter/mock-adapter";

// TODO(backend): once /progress/* endpoints exist in 05_API_CONTRACTS.md,
// implement a RealProgressAdapter against apiClient and swap it in here.
// No component or hook in src/components/progress or src/hooks/use-progress.ts
// should need to change.
export const progressAdapter: ProgressAdapter = mockProgressAdapter;

export type { ProgressAdapter } from "@/lib/progress-adapter/types";
