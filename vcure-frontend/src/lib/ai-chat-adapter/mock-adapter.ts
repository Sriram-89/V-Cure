import type { AiChatAdapter } from "@/lib/ai-chat-adapter/types";
import {
  MOCK_CONVERSATIONS,
  MOCK_MEDICAL_CONTEXT,
  MOCK_NUTRITION_CONTEXT,
  MOCK_QUICK_PROMPTS,
  MOCK_SUGGESTED_QUESTIONS,
  buildMockResponse
} from "@/lib/ai-chat-adapter/mock-data";
import type { ChatMessage, Conversation, ConversationDetail } from "@/types/ai-chat";

const SIMULATED_LATENCY_MS = 300;
const STREAM_CHUNK_DELAY_MS = 28;

function delay<T>(value: T, ms = SIMULATED_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let conversations: ConversationDetail[] = MOCK_CONVERSATIONS.map((c) => ({
  ...c,
  messages: [...c.messages]
}));

function findConversation(id: string): ConversationDetail {
  const conversation = conversations.find((c) => c.id === id);
  if (!conversation) throw new Error(`Conversation ${id} not found`);
  return conversation;
}

function toSummary(conversation: ConversationDetail): Conversation {
  const { messages: _messages, ...summary } = conversation;
  return summary;
}

export const mockAiChatAdapter: AiChatAdapter = {
  async getConversations() {
    return delay(conversations.map(toSummary));
  },

  async getConversation(conversationId: string) {
    return delay({ ...findConversation(conversationId) });
  },

  async createConversation() {
    const now = new Date().toISOString();
    const conversation: ConversationDetail = {
      id: `conv-${Date.now()}`,
      title: "New conversation",
      createdAt: now,
      updatedAt: now,
      lastMessagePreview: "",
      messages: []
    };
    conversations = [conversation, ...conversations];
    return delay({ ...conversation });
  },

  async renameConversation(conversationId: string, title: string) {
    const conversation = findConversation(conversationId);
    conversation.title = title;
    return delay(toSummary(conversation));
  },

  async deleteConversation(conversationId: string) {
    conversations = conversations.filter((c) => c.id !== conversationId);
    return delay(undefined);
  },

  async sendMessage(conversationId, content, onChunk) {
    const conversation = findConversation(conversationId);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content,
      status: "sent",
      createdAt: new Date().toISOString()
    };
    conversation.messages.push(userMessage);
    conversation.lastMessagePreview = content;
    conversation.updatedAt = userMessage.createdAt;
    if (conversation.title === "New conversation") {
      conversation.title = content.slice(0, 48);
    }

    const { text, safetyWarning } = buildMockResponse(content);
    const words = text.split(" ");
    let accumulated = "";

    for (const word of words) {
      accumulated += (accumulated ? " " : "") + word;
      onChunk(accumulated);
      // eslint-disable-next-line no-await-in-loop
      await delay(undefined, STREAM_CHUNK_DELAY_MS);
    }

    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}-assistant`,
      role: "assistant",
      content: text,
      status: "sent",
      createdAt: new Date().toISOString(),
      safetyWarning,
      sources:
        /quinoa|lunch|meal/i.test(content)
          ? [{ id: "src-meal", title: "Your active meal plan", type: "meal_plan" }]
          : undefined
    };
    conversation.messages.push(assistantMessage);
    conversation.lastMessagePreview = text.slice(0, 80);
    conversation.updatedAt = assistantMessage.createdAt;

    return assistantMessage;
  },

  async getSuggestedQuestions() {
    return delay(MOCK_SUGGESTED_QUESTIONS);
  },

  async getQuickPrompts() {
    return delay(MOCK_QUICK_PROMPTS);
  },

  async getMedicalContext() {
    return delay(MOCK_MEDICAL_CONTEXT);
  },

  async getNutritionContext() {
    return delay(MOCK_NUTRITION_CONTEXT);
  }
};
