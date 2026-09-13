import type { AiChatAdapter } from "@/lib/ai-chat-adapter/types";
import { mockAiChatAdapter } from "@/lib/ai-chat-adapter/mock-adapter";

// TODO(backend): once /ai-chat/* endpoints (and real streaming, e.g. SSE or
// WebSocket) exist per 05_API_CONTRACTS.md, implement a RealAiChatAdapter
// against it and swap it in here. All AI response generation and safety
// evaluation stays server-side — the frontend only renders what this
// adapter returns. No component or hook in src/components/ai-chat or
// src/hooks/use-ai-chat.ts should need to change.
export const aiChatAdapter: AiChatAdapter = mockAiChatAdapter;

export type { AiChatAdapter } from "@/lib/ai-chat-adapter/types";
