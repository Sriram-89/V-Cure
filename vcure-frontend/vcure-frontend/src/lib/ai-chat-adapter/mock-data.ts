import type {
  ConversationDetail,
  MedicalContextSnapshot,
  NutritionContextSnapshot,
  QuickPrompt,
  SuggestedQuestion
} from "@/types/ai-chat";

export const MOCK_SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { id: "sq1", label: "Why was this meal recommended?", prompt: "Why was today's lunch recommended for me?" },
  { id: "sq2", label: "Am I hitting my protein target?", prompt: "Am I hitting my daily protein target this week?" },
  { id: "sq3", label: "Explain my BMI trend", prompt: "Can you explain what my BMI trend means?" }
];

export const MOCK_QUICK_PROMPTS: QuickPrompt[] = [
  { id: "qp1", category: "Nutrition", label: "Suggest a snack", prompt: "Suggest a healthy snack for right now." },
  { id: "qp2", category: "Nutrition", label: "Check an ingredient", prompt: "Is honey safe for me given my profile?" },
  { id: "qp3", category: "Health", label: "Explain a lab term", prompt: "What does HbA1c mean?" },
  { id: "qp4", category: "Health", label: "Sleep tips", prompt: "How can I improve my sleep consistency?" }
];

export const MOCK_MEDICAL_CONTEXT: MedicalContextSnapshot = {
  conditions: ["Type 2 Diabetes (Managed)"],
  allergies: ["Peanuts"],
  medications: ["Metformin"]
};

export const MOCK_NUTRITION_CONTEXT: NutritionContextSnapshot = {
  today: {
    calories: 1240,
    macros: { proteinG: 58, carbsG: 140, fatG: 42 },
    micronutrients: [{ name: "Iron", amount: "6mg", percentOfDailyValue: 33 }]
  },
  calorieTargetToday: 2000
};

export const MOCK_CONVERSATIONS: ConversationDetail[] = [
  {
    id: "conv-1",
    title: "Lunch recommendation",
    createdAt: "2026-08-05T09:00:00Z",
    updatedAt: "2026-08-05T09:04:00Z",
    lastMessagePreview: "It's a good fit because it's high in fiber...",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Why was the quinoa bowl recommended for lunch today?",
        status: "sent",
        createdAt: "2026-08-05T09:00:00Z"
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "It's a good fit because it's high in fiber and plant-based protein, which lines up with your current goal and doesn't conflict with anything in your medical profile. It also stays within your calorie target for lunch.",
        status: "sent",
        createdAt: "2026-08-05T09:00:20Z",
        sources: [{ id: "src1", title: "Vegetable Quinoa Power Bowl", type: "meal_plan" }]
      }
    ]
  }
];

function containsAllergen(message: string, allergies: string[]): string | null {
  const lower = message.toLowerCase();
  return allergies.find((allergen) => lower.includes(allergen.toLowerCase())) ?? null;
}

export function buildMockResponse(
  userMessage: string
): { text: string; safetyWarning?: { level: "caution" | "blocked"; message: string } } {
  const matchedAllergen = containsAllergen(userMessage, MOCK_MEDICAL_CONTEXT.allergies);

  if (matchedAllergen) {
    return {
      text: `I'd be careful here — ${matchedAllergen.toLowerCase()} is listed as an allergy on your medical profile, so I'd avoid recommending anything containing it. Want me to suggest a safe alternative instead?`,
      safetyWarning: {
        level: "caution",
        message: `This mentions ${matchedAllergen}, which is on your allergy list.`
      }
    };
  }

  if (/hba1c|blood sugar|glucose/i.test(userMessage)) {
    return {
      text: "HbA1c reflects your average blood sugar over roughly the past 2-3 months, unlike a fasting glucose reading which only captures a single moment. It's one of the main markers used to monitor diabetes management over time — worth discussing trends with your doctor rather than a single reading in isolation."
    };
  }

  if (/protein/i.test(userMessage)) {
    return {
      text: "Based on your recent logs, you're averaging close to your protein target most days this week, with a couple of lower days around mid-week. Adding a protein-forward snack like Greek yogurt or roasted chickpeas on those days would help close the gap."
    };
  }

  return {
    text: "Here's what I can tell you based on your profile and recent activity: your plan currently prioritizes steady blood sugar and adequate protein, and nothing in today's log conflicts with your medical profile. Let me know if you want me to go deeper on any part of it."
  };
}
