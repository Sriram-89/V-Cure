import { create } from "zustand";

interface AiChatState {
  activeConversationId: string | null;
  streamingText: string | null;
  isStreaming: boolean;
  setActiveConversationId: (id: string | null) => void;
  setStreamingText: (text: string | null) => void;
  setIsStreaming: (isStreaming: boolean) => void;
}

export const useAiChatStore = create<AiChatState>()((set) => ({
  activeConversationId: null,
  streamingText: null,
  isStreaming: false,
  setActiveConversationId: (id) => set({ activeConversationId: id, streamingText: null, isStreaming: false }),
  setStreamingText: (text) => set({ streamingText: text }),
  setIsStreaming: (isStreaming) => set({ isStreaming })
}));
