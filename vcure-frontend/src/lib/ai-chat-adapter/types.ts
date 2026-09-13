import type {
  ChatMessage,
  Conversation,
  ConversationDetail,
  MedicalContextSnapshot,
  NutritionContextSnapshot,
  QuickPrompt,
  SuggestedQuestion
} from "@/types/ai-chat";

export interface AiChatAdapter {
  getConversations(): Promise<Conversation[]>;
  getConversation(conversationId: string): Promise<ConversationDetail>;
  createConversation(): Promise<ConversationDetail>;
  renameConversation(conversationId: string, title: string): Promise<Conversation>;
  deleteConversation(conversationId: string): Promise<void>;
  // Streams the assistant's response via onChunk (cumulative text) and
  // resolves with the final persisted ChatMessage once complete. The
  // frontend never composes response content — it only renders what the
  // adapter (backed by a real AI service, eventually) sends back.
  sendMessage(
    conversationId: string,
    content: string,
    onChunk: (partialText: string) => void
  ): Promise<ChatMessage>;
  getSuggestedQuestions(): Promise<SuggestedQuestion[]>;
  getQuickPrompts(): Promise<QuickPrompt[]>;
  getMedicalContext(): Promise<MedicalContextSnapshot>;
  getNutritionContext(): Promise<NutritionContextSnapshot>;
}
